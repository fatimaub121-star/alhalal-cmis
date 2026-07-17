from django.db import models
from apps.accounts.models import Member


class Loan(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('disbursed', 'Disbursed'),
        ('repaying', 'Repaying'),
        ('completed', 'Completed'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='loans')
    loan_number = models.CharField(max_length=20, unique=True)
    amount_requested = models.DecimalField(max_digits=12, decimal_places=2)
    amount_approved = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    purpose = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    applied_on = models.DateField(auto_now_add=True)
    approved_on = models.DateField(null=True, blank=True)
    repayment_months = models.PositiveIntegerField(default=6)  # repayment period
    monthly_repayment = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_repaid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    admin_notes = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='loans_approved'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.loan_number} - {self.member.member_id}'

    @property
    def balance_outstanding(self):
        if self.amount_approved is not None:
            from decimal import Decimal
            return Decimal(str(self.amount_approved)) - Decimal(str(self.total_repaid))
        return self.amount_requested

    def save(self, *args, **kwargs):
        if not self.loan_number:
            count = Loan.objects.count() + 1
            self.loan_number = f'LN{count:05d}'
        super().save(*args, **kwargs)


class LoanRepayment(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='repayments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date_paid = models.DateField()
    recorded_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='repayments_recorded'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_paid']

    def __str__(self):
        return f'Repayment {self.loan.loan_number} - {self.amount}'
