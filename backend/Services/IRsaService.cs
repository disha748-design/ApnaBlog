namespace BlogApi.Services
{
    public interface IRsaService
    {
        string GetPublicKey();
        string Decrypt(string base64Encrypted);
    }
}
