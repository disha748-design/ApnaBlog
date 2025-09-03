using System.Security.Cryptography;
using System.Text;

namespace BlogApi.Services.Impl
{
    public class RsaService : IRsaService
    {
        private readonly RSA _privateRsa;
        private readonly string _publicKey;

        public RsaService()
        {
            string keyDir = "Keys";
            string privateKeyPath = Path.Combine(keyDir, "private.key");
            string publicKeyPath = Path.Combine(keyDir, "public.pem");

            Directory.CreateDirectory(keyDir);

            if (File.Exists(privateKeyPath))
            {
                // Load existing private key
                _privateRsa = RSA.Create();
                var privateKeyBytes = File.ReadAllBytes(privateKeyPath);
                _privateRsa.ImportRSAPrivateKey(privateKeyBytes, out _);

                // Always regenerate public PEM text from private
                var pubBytes = _privateRsa.ExportSubjectPublicKeyInfo();
                _publicKey = PemEncode("PUBLIC KEY", pubBytes);
            }
            else
            {
                // Generate new keypair
                _privateRsa = RSA.Create(2048);

                // Save private key (binary)
                File.WriteAllBytes(privateKeyPath, _privateRsa.ExportRSAPrivateKey());

                // Save public key as PEM text
                var pubBytes = _privateRsa.ExportSubjectPublicKeyInfo();
                _publicKey = PemEncode("PUBLIC KEY", pubBytes);
                File.WriteAllText(publicKeyPath, _publicKey);
            }
        }

        public string GetPublicKey() => _publicKey;

        public string Decrypt(string base64Encrypted)
        {
            var encryptedBytes = Convert.FromBase64String(base64Encrypted);
            var decrypted = _privateRsa.Decrypt(encryptedBytes, RSAEncryptionPadding.Pkcs1);
            return Encoding.UTF8.GetString(decrypted);
        }

        private static string PemEncode(string label, byte[] data)
        {
            var base64 = Convert.ToBase64String(data, Base64FormattingOptions.InsertLineBreaks);
            return $"-----BEGIN {label}-----\n{base64}\n-----END {label}-----";
        }
    }
}
