from django.db import models
from apps.accounts.models import Member


class Share(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='share_set')
    quantity = models.PositiveIntegerField()
    unit_value = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    date_allocated = models.DateField()
    recorded_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='shares_recorded'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_allocated']

    def __str__(self):
        return f'{self.member.member_id} - {self.quantity} shares'

    @property
    def total_value(self):
        return self.quantity * self.unit_value
