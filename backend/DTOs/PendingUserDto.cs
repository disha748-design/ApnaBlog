namespace APNABLOG_proj.DTOs
{
    public class PendingUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string? RequestedRole { get; set; }
    }
}
