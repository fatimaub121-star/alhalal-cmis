from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/members/', include('apps.accounts.member_urls')),
    path('api/savings/', include('apps.savings.urls')),
    path('api/loans/', include('apps.loans.urls')),
    path('api/shares/', include('apps.shares.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/reports/', include('apps.reports.urls')),
]
