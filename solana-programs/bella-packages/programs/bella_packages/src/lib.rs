use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

// Replace this development address with the keypair generated for the audited deployment.
declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZ8S6J9s8fU9QyM6wPLw6");

#[program]
pub mod bella_packages {
    use super::*;

    pub fn initialize_wallet(ctx: Context<InitializeWallet>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.owner = ctx.accounts.customer.key();
        wallet.bump = ctx.bumps.wallet;
        Ok(())
    }

    pub fn create_package(
        ctx: Context<CreatePackage>,
        package_ref: u64,
        price_units: u64,
        active: bool,
    ) -> Result<()> {
        require!(price_units > 0, BellaError::InvalidAmount);
        let package = &mut ctx.accounts.package;
        package.provider = ctx.accounts.provider.key();
        package.mint = ctx.accounts.mint.key();
        package.package_ref = package_ref;
        package.price_units = price_units;
        package.active = active;
        package.bump = ctx.bumps.package;
        emit!(PackageCreated { package: package.key(), provider: package.provider, mint: package.mint, package_ref, price_units, active });
        Ok(())
    }

    pub fn set_package_active(ctx: Context<SetPackageActive>, active: bool) -> Result<()> {
        ctx.accounts.package.active = active;
        emit!(PackageActivationChanged { package: ctx.accounts.package.key(), active });
        Ok(())
    }

    pub fn buy_package(
        ctx: Context<BuyPackage>,
        purchase_ref: u64,
        amount_units: u64,
    ) -> Result<()> {
        require!(ctx.accounts.package.active, BellaError::PackageInactive);
        require!(amount_units > 0, BellaError::InvalidAmount);
        require!(amount_units == ctx.accounts.package.price_units, BellaError::InvalidAmount);

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.customer_tokens.to_account_info(),
                    to: ctx.accounts.wallet_tokens.to_account_info(),
                    authority: ctx.accounts.customer.to_account_info(),
                },
                &[],
            ),
            amount_units,
        )?;

        let purchase = &mut ctx.accounts.purchase;
        purchase.wallet = ctx.accounts.wallet.key();
        purchase.customer = ctx.accounts.customer.key();
        purchase.provider = ctx.accounts.package.provider;
        purchase.mint = ctx.accounts.package.mint;
        purchase.purchase_ref = purchase_ref;
        purchase.total_units = amount_units;
        purchase.available_units = amount_units;
        purchase.reserved_units = 0;
        purchase.bump = ctx.bumps.purchase;
        emit!(PackagePurchased { purchase: purchase.key(), customer: purchase.customer, amount_units });
        Ok(())
    }

    pub fn reserve_service(
        ctx: Context<ReserveService>,
        reservation_ref: u64,
        service_ref: u64,
        policy_version: u32,
        amount_units: u64,
        starts_at: i64,
        cancellation_deadline: i64,
        late_cancel_fee_bps: u16,
        no_show_fee_bps: u16,
    ) -> Result<()> {
        require_keys_eq!(ctx.accounts.customer.key(), ctx.accounts.purchase.customer, BellaError::Unauthorized);
        require!(amount_units > 0, BellaError::InvalidAmount);
        require!(amount_units <= ctx.accounts.purchase.available_units, BellaError::InsufficientBalance);
        require!(cancellation_deadline <= starts_at, BellaError::InvalidPolicy);
        require!(late_cancel_fee_bps <= 10_000 && no_show_fee_bps <= 10_000, BellaError::InvalidPolicy);

        let purchase = &ctx.accounts.purchase;
        let reservation = &mut ctx.accounts.reservation;
        reservation.purchase = purchase.key();
        reservation.customer = purchase.customer;
        reservation.provider = purchase.provider;
        reservation.service_ref = service_ref;
        reservation.policy_version = policy_version;
        reservation.amount_units = amount_units;
        reservation.starts_at = starts_at;
        reservation.cancellation_deadline = cancellation_deadline;
        reservation.late_cancel_fee_bps = late_cancel_fee_bps;
        reservation.no_show_fee_bps = no_show_fee_bps;
        reservation.status = ReservationStatus::Pending;
        reservation.customer_approved_units = 0;
        reservation.provider_approved_units = 0;
        reservation.bump = ctx.bumps.reservation;
        emit!(ReservationProposed { reservation: reservation.key(), customer: reservation.customer, provider: reservation.provider, service_ref, policy_version, amount_units });
        Ok(())
    }

    pub fn accept_reservation(ctx: Context<AcceptReservation>) -> Result<()> {
        require_keys_eq!(ctx.accounts.provider.key(), ctx.accounts.reservation.provider, BellaError::Unauthorized);
        require!(ctx.accounts.reservation.status == ReservationStatus::Pending, BellaError::InvalidStatus);
        let amount = ctx.accounts.reservation.amount_units;
        let purchase = &mut ctx.accounts.purchase;
        require!(amount <= purchase.available_units, BellaError::InsufficientBalance);
        purchase.available_units = purchase.available_units.checked_sub(amount).ok_or(BellaError::MathOverflow)?;
        purchase.reserved_units = purchase.reserved_units.checked_add(amount).ok_or(BellaError::MathOverflow)?;
        ctx.accounts.reservation.status = ReservationStatus::Reserved;
        emit!(ServiceReserved { reservation: ctx.accounts.reservation.key(), customer: ctx.accounts.reservation.customer, provider: ctx.accounts.reservation.provider, service_ref: ctx.accounts.reservation.service_ref, policy_version: ctx.accounts.reservation.policy_version, amount_units: amount });
        Ok(())
    }

    pub fn approve_settlement(ctx: Context<ApproveSettlement>, used_units: u64) -> Result<()> {
        require!(ctx.accounts.reservation.status == ReservationStatus::Reserved, BellaError::InvalidStatus);
        require!(used_units > 0 && used_units <= ctx.accounts.reservation.amount_units, BellaError::InvalidAmount);
        let reservation = &mut ctx.accounts.reservation;
        require!(reservation.customer_approved_units == 0 || reservation.customer_approved_units == used_units, BellaError::ApprovalMismatch);
        require!(reservation.provider_approved_units == 0 || reservation.provider_approved_units == used_units, BellaError::ApprovalMismatch);
        if ctx.accounts.approver.key() == reservation.customer { reservation.customer_approved_units = used_units; }
        else if ctx.accounts.approver.key() == reservation.provider { reservation.provider_approved_units = used_units; }
        else { return err!(BellaError::Unauthorized); }
        emit!(SettlementApprovalRecorded { reservation: reservation.key(), approver: ctx.accounts.approver.key(), used_units });
        Ok(())
    }

    pub fn settle_service(ctx: Context<SettleService>) -> Result<()> {
        require!(ctx.accounts.reservation.status == ReservationStatus::Reserved, BellaError::InvalidStatus);
        let used = ctx.accounts.reservation.customer_approved_units;
        require!(used > 0 && used == ctx.accounts.reservation.provider_approved_units, BellaError::BothApprovalsRequired);
        let amount = ctx.accounts.reservation.amount_units;
        let refund = amount - used;
        transfer_from_wallet(&ctx.accounts.wallet, &ctx.accounts.wallet_tokens, &ctx.accounts.provider_tokens, &ctx.accounts.token_program, used)?;
        let purchase = &mut ctx.accounts.purchase;
        purchase.reserved_units = purchase.reserved_units.checked_sub(amount).ok_or(BellaError::MathOverflow)?;
        purchase.available_units = purchase.available_units.checked_add(refund).ok_or(BellaError::MathOverflow)?;
        purchase.total_units = purchase.total_units.checked_sub(used).ok_or(BellaError::MathOverflow)?;
        ctx.accounts.reservation.status = ReservationStatus::Settled;
        emit!(ServiceSettled { reservation: ctx.accounts.reservation.key(), paid_units: used, returned_units: refund });
        Ok(())
    }

    pub fn cancel_service(ctx: Context<CancelService>) -> Result<()> {
        require_keys_eq!(ctx.accounts.customer.key(), ctx.accounts.reservation.customer, BellaError::Unauthorized);
        if ctx.accounts.reservation.status == ReservationStatus::Pending {
            ctx.accounts.reservation.status = ReservationStatus::Cancelled;
            emit!(ReservationCancelled { reservation: ctx.accounts.reservation.key(), provider_fee_units: 0, returned_units: 0, no_show: false });
            return Ok(());
        }
        require!(ctx.accounts.reservation.status == ReservationStatus::Reserved, BellaError::InvalidStatus);

        let now = Clock::get()?.unix_timestamp;
        let fee_bps = if now <= ctx.accounts.reservation.cancellation_deadline {
            0
        } else {
            ctx.accounts.reservation.late_cancel_fee_bps
        };
        finish_cancellation(ctx, fee_bps)
    }

    pub fn provider_cancel_service(ctx: Context<ProviderCancelService>) -> Result<()> {
        require_keys_eq!(ctx.accounts.provider.key(), ctx.accounts.reservation.provider, BellaError::Unauthorized);
        require!(ctx.accounts.reservation.status == ReservationStatus::Reserved, BellaError::InvalidStatus);
        finish_provider_cancellation(ctx)
    }

    pub fn claim_no_show(ctx: Context<ClaimNoShow>) -> Result<()> {
        require_keys_eq!(ctx.accounts.provider.key(), ctx.accounts.reservation.provider, BellaError::Unauthorized);
        require!(ctx.accounts.reservation.status == ReservationStatus::Reserved, BellaError::InvalidStatus);
        require!(Clock::get()?.unix_timestamp > ctx.accounts.reservation.starts_at, BellaError::TooEarly);
        let fee_bps = ctx.accounts.reservation.no_show_fee_bps;
        finish_no_show(ctx, fee_bps)
    }

    pub fn withdraw_available(ctx: Context<WithdrawAvailable>, amount_units: u64) -> Result<()> {
        require_keys_eq!(ctx.accounts.customer.key(), ctx.accounts.purchase.customer, BellaError::Unauthorized);
        require!(amount_units > 0 && amount_units <= ctx.accounts.purchase.available_units, BellaError::InsufficientBalance);
        transfer_from_wallet(
            &ctx.accounts.wallet,
            &ctx.accounts.wallet_tokens,
            &ctx.accounts.customer_tokens,
            &ctx.accounts.token_program,
            amount_units,
        )?;
        let purchase = &mut ctx.accounts.purchase;
        purchase.available_units = purchase.available_units.checked_sub(amount_units).ok_or(BellaError::MathOverflow)?;
        purchase.total_units = purchase.total_units.checked_sub(amount_units).ok_or(BellaError::MathOverflow)?;
        emit!(AvailableBalanceWithdrawn { purchase: purchase.key(), customer: purchase.customer, amount_units });
        Ok(())
    }
}

fn transfer_from_wallet<'info>(
    wallet: &Account<'info, SmartWallet>,
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    let bump = [wallet.bump];
    let signer: &[&[u8]] = &[b"wallet", wallet.owner.as_ref(), &bump];
    token::transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            Transfer { from: from.to_account_info(), to: to.to_account_info(), authority: wallet.to_account_info() },
            &[signer],
        ),
        amount,
    )
}

fn finish_cancellation(ctx: Context<CancelService>, fee_bps: u16) -> Result<()> {
    let amount = ctx.accounts.reservation.amount_units;
    let fee = amount.checked_mul(fee_bps as u64).ok_or(BellaError::MathOverflow)? / 10_000;
    if fee > 0 {
        transfer_from_wallet(&ctx.accounts.wallet, &ctx.accounts.wallet_tokens, &ctx.accounts.provider_tokens, &ctx.accounts.token_program, fee)?;
    }
    let purchase = &mut ctx.accounts.purchase;
    purchase.reserved_units = purchase.reserved_units.checked_sub(amount).ok_or(BellaError::MathOverflow)?;
    purchase.available_units = purchase.available_units.checked_add(amount - fee).ok_or(BellaError::MathOverflow)?;
    purchase.total_units = purchase.total_units.checked_sub(fee).ok_or(BellaError::MathOverflow)?;
    ctx.accounts.reservation.status = ReservationStatus::Cancelled;
    emit!(ReservationCancelled { reservation: ctx.accounts.reservation.key(), provider_fee_units: fee, returned_units: amount - fee, no_show: false });
    Ok(())
}

fn finish_provider_cancellation(ctx: Context<ProviderCancelService>) -> Result<()> {
    let amount = ctx.accounts.reservation.amount_units;
    let purchase = &mut ctx.accounts.purchase;
    purchase.reserved_units = purchase.reserved_units.checked_sub(amount).ok_or(BellaError::MathOverflow)?;
    purchase.available_units = purchase.available_units.checked_add(amount).ok_or(BellaError::MathOverflow)?;
    ctx.accounts.reservation.status = ReservationStatus::ProviderCancelled;
    emit!(ReservationCancelled { reservation: ctx.accounts.reservation.key(), provider_fee_units: 0, returned_units: amount, no_show: false });
    Ok(())
}

fn finish_no_show(ctx: Context<ClaimNoShow>, fee_bps: u16) -> Result<()> {
    let amount = ctx.accounts.reservation.amount_units;
    let fee = amount.checked_mul(fee_bps as u64).ok_or(BellaError::MathOverflow)? / 10_000;
    if fee > 0 {
        transfer_from_wallet(&ctx.accounts.wallet, &ctx.accounts.wallet_tokens, &ctx.accounts.provider_tokens, &ctx.accounts.token_program, fee)?;
    }
    let purchase = &mut ctx.accounts.purchase;
    purchase.reserved_units = purchase.reserved_units.checked_sub(amount).ok_or(BellaError::MathOverflow)?;
    purchase.available_units = purchase.available_units.checked_add(amount - fee).ok_or(BellaError::MathOverflow)?;
    purchase.total_units = purchase.total_units.checked_sub(fee).ok_or(BellaError::MathOverflow)?;
    ctx.accounts.reservation.status = ReservationStatus::NoShow;
    emit!(ReservationCancelled { reservation: ctx.accounts.reservation.key(), provider_fee_units: fee, returned_units: amount - fee, no_show: true });
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeWallet<'info> {
    #[account(mut)] pub customer: Signer<'info>,
    #[account(init, payer = customer, space = 8 + SmartWallet::INIT_SPACE, seeds = [b"wallet", customer.key().as_ref()], bump)] pub wallet: Account<'info, SmartWallet>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(package_ref: u64)]
pub struct CreatePackage<'info> {
    #[account(mut)] pub provider: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(init, payer = provider, space = 8 + Package::INIT_SPACE, seeds = [b"package", provider.key().as_ref(), &package_ref.to_le_bytes()], bump)] pub package: Account<'info, Package>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPackageActive<'info> {
    pub provider: Signer<'info>,
    #[account(mut, has_one = provider)] pub package: Account<'info, Package>,
}

#[derive(Accounts)]
#[instruction(purchase_ref: u64)]
pub struct BuyPackage<'info> {
    #[account(mut)] pub customer: Signer<'info>,
    #[account(seeds = [b"wallet", customer.key().as_ref()], bump = wallet.bump, constraint = wallet.owner == customer.key())] pub wallet: Account<'info, SmartWallet>,
    #[account(has_one = provider, has_one = mint)] pub package: Account<'info, Package>,
    /// CHECK: The provider address is pinned by the package account.
    pub provider: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = customer)] pub customer_tokens: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = customer, associated_token::mint = mint, associated_token::authority = wallet)] pub wallet_tokens: Account<'info, TokenAccount>,
    #[account(init, payer = customer, space = 8 + Purchase::INIT_SPACE, seeds = [b"purchase", wallet.key().as_ref(), &purchase_ref.to_le_bytes()], bump)] pub purchase: Account<'info, Purchase>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(reservation_ref: u64)]
pub struct ReserveService<'info> {
    #[account(mut)] pub customer: Signer<'info>,
    /// CHECK: Provider is pinned by purchase.
    pub provider: UncheckedAccount<'info>,
    #[account(mut, has_one = customer, has_one = provider)] pub purchase: Account<'info, Purchase>,
    #[account(init, payer = customer, space = 8 + Reservation::INIT_SPACE, seeds = [b"reservation", purchase.key().as_ref(), &reservation_ref.to_le_bytes()], bump)] pub reservation: Account<'info, Reservation>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleService<'info> {
    #[account(mut)] pub payer: Signer<'info>,
    /// CHECK: Approvals are recorded in the reservation account.
    pub customer: UncheckedAccount<'info>,
    /// CHECK: Approvals are recorded in the reservation account.
    pub provider: UncheckedAccount<'info>,
    #[account(mut, has_one = customer, has_one = provider)] pub purchase: Account<'info, Purchase>,
    #[account(mut, has_one = customer, has_one = provider, has_one = purchase)] pub reservation: Account<'info, Reservation>,
    #[account(seeds = [b"wallet", customer.key().as_ref()], bump = wallet.bump)] pub wallet: Account<'info, SmartWallet>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = wallet)] pub wallet_tokens: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = payer, associated_token::mint = mint, associated_token::authority = provider)] pub provider_tokens: Account<'info, TokenAccount>,
    #[account(address = purchase.mint)] pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptReservation<'info> {
    pub provider: Signer<'info>,
    #[account(mut, has_one = customer, has_one = provider)] pub purchase: Account<'info, Purchase>,
    /// CHECK: Customer is pinned to purchase.
    pub customer: UncheckedAccount<'info>,
    #[account(mut, has_one = customer, has_one = provider, has_one = purchase)] pub reservation: Account<'info, Reservation>,
}

#[derive(Accounts)]
pub struct ApproveSettlement<'info> {
    pub approver: Signer<'info>,
    #[account(mut, has_one = customer, has_one = provider)] pub purchase: Account<'info, Purchase>,
    /// CHECK: Customer is pinned to purchase and reservation.
    pub customer: UncheckedAccount<'info>,
    /// CHECK: Provider is pinned to purchase and reservation.
    pub provider: UncheckedAccount<'info>,
    #[account(mut, has_one = customer, has_one = provider, has_one = purchase)] pub reservation: Account<'info, Reservation>,
}

#[derive(Accounts)]
pub struct CancelService<'info> {
    #[account(mut)] pub customer: Signer<'info>,
    #[account(mut, has_one = customer, has_one = provider)] pub purchase: Account<'info, Purchase>,
    #[account(mut, has_one = customer, has_one = provider, has_one = purchase)] pub reservation: Account<'info, Reservation>,
    #[account(seeds = [b"wallet", customer.key().as_ref()], bump = wallet.bump)] pub wallet: Account<'info, SmartWallet>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = wallet)] pub wallet_tokens: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = customer, associated_token::mint = mint, associated_token::authority = provider)] pub provider_tokens: Account<'info, TokenAccount>,
    #[account(address = purchase.mint)] pub mint: Account<'info, Mint>,
    /// CHECK: Provider is pinned to purchase and reservation.
    pub provider: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProviderCancelService<'info> {
    pub provider: Signer<'info>,
    #[account(mut, has_one = customer, has_one = provider)] pub purchase: Account<'info, Purchase>,
    #[account(mut, has_one = customer, has_one = provider, has_one = purchase)] pub reservation: Account<'info, Reservation>,
    #[account(seeds = [b"wallet", customer.key().as_ref()], bump = wallet.bump)] pub wallet: Account<'info, SmartWallet>,
    /// CHECK: Customer wallet owner is pinned by purchase/reservation.
    pub customer: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ClaimNoShow<'info> {
    #[account(mut)] pub provider: Signer<'info>,
    #[account(mut, has_one = customer, has_one = provider)] pub purchase: Account<'info, Purchase>,
    #[account(mut, has_one = customer, has_one = provider, has_one = purchase)] pub reservation: Account<'info, Reservation>,
    #[account(seeds = [b"wallet", customer.key().as_ref()], bump = wallet.bump)] pub wallet: Account<'info, SmartWallet>,
    /// CHECK: Customer wallet owner is pinned by purchase/reservation.
    pub customer: UncheckedAccount<'info>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = wallet)] pub wallet_tokens: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = provider, associated_token::mint = mint, associated_token::authority = provider)] pub provider_tokens: Account<'info, TokenAccount>,
    #[account(address = purchase.mint)] pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawAvailable<'info> {
    #[account(mut)] pub customer: Signer<'info>,
    #[account(mut, has_one = customer)] pub purchase: Account<'info, Purchase>,
    #[account(seeds = [b"wallet", customer.key().as_ref()], bump = wallet.bump, constraint = wallet.owner == customer.key())] pub wallet: Account<'info, SmartWallet>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = wallet)] pub wallet_tokens: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = customer, associated_token::mint = mint, associated_token::authority = customer)] pub customer_tokens: Account<'info, TokenAccount>,
    #[account(address = purchase.mint)] pub mint: Account<'info, Mint>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct SmartWallet { pub owner: Pubkey, pub bump: u8 }

#[account]
#[derive(InitSpace)]
pub struct Package {
    pub provider: Pubkey, pub mint: Pubkey, pub package_ref: u64,
    pub price_units: u64, pub active: bool, pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Purchase {
    pub wallet: Pubkey, pub customer: Pubkey, pub provider: Pubkey, pub mint: Pubkey,
    pub purchase_ref: u64, pub total_units: u64, pub available_units: u64,
    pub reserved_units: u64, pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Reservation {
    pub purchase: Pubkey, pub customer: Pubkey, pub provider: Pubkey,
    pub service_ref: u64, pub policy_version: u32,
    pub amount_units: u64, pub starts_at: i64, pub cancellation_deadline: i64,
    pub late_cancel_fee_bps: u16, pub no_show_fee_bps: u16,
    pub status: ReservationStatus, pub customer_approved_units: u64, pub provider_approved_units: u64, pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ReservationStatus { Pending, Reserved, Settled, Cancelled, ProviderCancelled, NoShow }

#[event]
pub struct PackagePurchased { pub purchase: Pubkey, pub customer: Pubkey, pub amount_units: u64 }

#[event]
pub struct ServiceReserved { pub reservation: Pubkey, pub customer: Pubkey, pub provider: Pubkey, pub service_ref: u64, pub policy_version: u32, pub amount_units: u64 }
#[event]
pub struct ReservationProposed { pub reservation: Pubkey, pub customer: Pubkey, pub provider: Pubkey, pub service_ref: u64, pub policy_version: u32, pub amount_units: u64 }
#[event]
pub struct SettlementApprovalRecorded { pub reservation: Pubkey, pub approver: Pubkey, pub used_units: u64 }

#[event]
pub struct ServiceSettled { pub reservation: Pubkey, pub paid_units: u64, pub returned_units: u64 }

#[event]
pub struct PackageCreated { pub package: Pubkey, pub provider: Pubkey, pub mint: Pubkey, pub package_ref: u64, pub price_units: u64, pub active: bool }

#[event]
pub struct PackageActivationChanged { pub package: Pubkey, pub active: bool }

#[event]
pub struct ReservationCancelled { pub reservation: Pubkey, pub provider_fee_units: u64, pub returned_units: u64, pub no_show: bool }

#[event]
pub struct AvailableBalanceWithdrawn { pub purchase: Pubkey, pub customer: Pubkey, pub amount_units: u64 }

#[error_code]
pub enum BellaError {
    #[msg("Amount must be greater than zero")] InvalidAmount,
    #[msg("Package is inactive")] PackageInactive,
    #[msg("Insufficient available balance")] InsufficientBalance,
    #[msg("Wallet or provider is not authorized")] Unauthorized,
    #[msg("Invalid reservation status")] InvalidStatus,
    #[msg("Cancellation policy is invalid")] InvalidPolicy,
    #[msg("Arithmetic overflow")] MathOverflow,
    #[msg("No-show cannot be claimed before service start")] TooEarly,
    #[msg("Both parties must approve the same settlement amount")] BothApprovalsRequired,
    #[msg("Settlement approvals must specify the same amount")] ApprovalMismatch,
}
