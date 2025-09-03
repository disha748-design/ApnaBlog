namespace BlogApi.DTOs.Auth
{
    public class AdminLoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!; // plain text
    }
}
