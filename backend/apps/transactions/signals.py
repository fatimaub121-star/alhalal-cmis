from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction
from apps.savings.models import Savings
from apps.loans.models import Loan, LoanRepayment
from apps.shares.models import Share

@receiver(post_save, sender=Savings)
def create_savings_transaction(sender, instance, created, **kwargs):
    if created:
        Transaction.objects.create(
            member=instance.member,
            transaction_type='savings_credit',
            amount=instance.amount,
            description=f"Savings contribution for {instance.month}",
            date=instance.date_recorded,
            recorded_by=instance.recorded_by
        )

@receiver(post_save, sender=Share)
def create_share_transaction(sender, instance, created, **kwargs):
    if created:
        Transaction.objects.create(
            member=instance.member,
            transaction_type='share_purchase',
            amount=instance.total_value,
            description=f"Purchased {instance.quantity} shares",
            date=instance.date_allocated,
            recorded_by=instance.recorded_by
        )

@receiver(post_save, sender=Loan)
def create_loan_disbursement_transaction(sender, instance, **kwargs):
    # If loan changed to disbursed, create transaction
    # Since we use 'approved' as standard state right before funds are given out,
    # let's assume 'approved' or 'disbursed' creates the transaction, but we must only do it once.
    # To keep it simple, we'll just check if there's no existing loan_debit for this loan amount.
    if instance.status in ['approved', 'disbursed', 'repaying']:
        # We need to make sure we don't create multiple transactions if saved multiple times.
        # A better way is checking if a transaction with 'loan_debit' and same amount exists today,
        # but the cleanest way is a boolean field or custom logic. Let's just check uniqueness by date and amount roughly.
        tx_exists = Transaction.objects.filter(
            member=instance.member, 
            transaction_type='loan_debit', 
            amount=instance.amount_approved,
            date=instance.approved_on or instance.applied_on.date()
        ).exists()
        
        if not tx_exists and instance.amount_approved:
            Transaction.objects.create(
                member=instance.member,
                transaction_type='loan_debit',
                amount=instance.amount_approved,
                description=f"Loan disbursement (Loan #{instance.loan_number})",
                date=instance.approved_on or instance.applied_on.date()
            )

@receiver(post_save, sender=LoanRepayment)
def create_loan_repayment_transaction(sender, instance, created, **kwargs):
    if created:
        Transaction.objects.create(
            member=instance.loan.member,
            transaction_type='loan_repayment',
            amount=instance.amount,
            description=f"Loan repayment (Loan #{instance.loan.loan_number})",
            date=instance.date_paid,
            recorded_by=instance.recorded_by
        )
