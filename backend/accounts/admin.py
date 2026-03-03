from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

# Re-register the default UserAdmin (already registered, just for reference)
# admin.site.unregister(User)
# admin.site.register(User, UserAdmin)
