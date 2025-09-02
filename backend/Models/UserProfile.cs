using BlogApi.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class UserProfile
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = null!;  // still required

    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;

    public string? ProfileImageUrl { get; set; }  // nullable

    public string? AboutMe { get; set; }          // nullable

    public string? Preferences { get; set; }      // nullable
}
