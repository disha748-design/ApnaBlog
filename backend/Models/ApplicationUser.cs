using Microsoft.AspNetCore.Identity;

namespace BlogApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? DisplayName { get; set; }
        public string? AboutMe { get; set; }
        public string? ProfileImageUrl { get; set; } // store relative url like /uploads/...
        public bool IsApproved { get; set; } = false; // admin must approve
        public string? PreferencesJson { get; set; }

        public string? RequestedRole { get; set; }
    }
}

