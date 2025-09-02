namespace BlogApi.DTOs.Auth
{
    public class RegisterDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? DisplayName { get; set; }
        // "role" hint if someone signs up as editor - admin still must approve/assign role later
        public string? RequestedRole { get; set; }
    }
}
