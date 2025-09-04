using System;

using BlogApi.DTOs.Auth;
using System.Threading.Tasks;

using BlogApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _svc;
        public AuthController(IAuthService svc) { _svc = svc; }


[HttpPost("admin-login")]
public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto dto)
{
    var success = await _svc.LoginAdminAsync(dto.Email, dto.Password);
    if (!success)
        return Unauthorized(new { message = "Invalid admin credentials." });

    return Ok(new
    {
        id = "admin",
        email = dto.Email,
        displayName = "Administrator",
        role = "Admin"
    });
}
[HttpGet("rsa-public")]
[AllowAnonymous]
public IActionResult GetRsaPublicKey([FromServices] IRsaService rsa)
{
    return Ok(new { publicKey = rsa.GetPublicKey() });
}

[HttpPost("register")]
[AllowAnonymous]
public async Task<IActionResult> Register([FromBody] RegisterDto dto, [FromServices] IRsaService rsaService)
{
    try
    {
        // Decrypt only once here
        dto.Password = rsaService.Decrypt(dto.Password);
        Console.WriteLine("Decrypted password: " + dto.Password);
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = "Password decryption failed", error = ex.Message, received = dto.Password });
    }

    // Pass plain password to the service
    var r = await _svc.RegisterAsync(dto);

    if (!r.Succeeded) 
        return BadRequest(r.Errors);

    return Ok(new { message = "Registered. Wait for admin approval." });
}


[HttpPost("login")]
[AllowAnonymous]
public async Task<IActionResult> Login([FromBody] LoginDto dto)
{
    var user = await _svc.LoginWithUserAsync(dto);

    if (user == null || !user.IsApproved)
        return Unauthorized(new { message = "Invalid credentials or not approved." });

    var userRoles = await _svc.GetRolesAsync(user);

    return Ok(new
    {
        id = user.Id,
        email = user.Email,
        displayName = user.DisplayName,
        role = userRoles.FirstOrDefault(),
        isApproved = user.IsApproved
    });
}


     [Authorize] 
      [HttpPost("logout")]
      public async Task<IActionResult> Logout()
        {
            await _svc.LogoutAsync();
            return Ok();
        }


    }
}
