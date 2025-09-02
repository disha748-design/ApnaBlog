using BlogApi.Data;
using BlogApi.DTOs.Comments;
using BlogApi.DTOs.Posts;
using BlogApi.Models;
using BlogApi.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace BlogApi.Services.Impl
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepo;
        private readonly IGenericRepository<PostImage> _imgRepo;
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public PostService(IPostRepository postRepo, IGenericRepository<PostImage> imgRepo, ApplicationDbContext db, IWebHostEnvironment webHostEnvironment)
        {
            _postRepo = postRepo;
            _imgRepo = imgRepo;
            _db = db;
            _webHostEnvironment = webHostEnvironment;
        }
        public async Task<Post> CreatePostAsync(string authorId, PostCreateDto dto, IFormFile[]? images, string webRootPath)
        {
            var p = new Post
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Content = dto.Content,
                AuthorId = authorId,
                Status = PostStatus.PendingApproval,
                CreatedAt = DateTime.UtcNow
            };
            if (images != null && images.Length > 0)
            {
                var uploadDir = Path.Combine(webRootPath, "Uploads");
                Directory.CreateDirectory(uploadDir);
                int order = 0;
                foreach (var file in images)
                {
                    if (file.Length <= 0) continue;
                    var ext = Path.GetExtension(file.FileName);
                    var fileName = $"{Guid.NewGuid()}{ext}";
                    var savePath = Path.Combine(uploadDir, fileName);
                    using (var fs = new FileStream(savePath, FileMode.Create))
                    {
                        await file.CopyToAsync(fs);
                    }
                    var url = $"/Uploads/{fileName}";
                    p.Images.Add(new PostImage { Id = Guid.NewGuid(), FileName = fileName, Url = url, SortOrder = order++ });
                }
            }

            await _postRepo.AddAsync(p);
            await _postRepo.SaveAsync();
            return p;
        }
        public async Task<List<Post>> GetPendingPostsAsync()
        {
            return await _postRepo.Query()
        .Where(p => p.Status == PostStatus.PendingApproval) // must use enum, not string
        .Include(p => p.Author)
        .Include(p => p.Images)
        .ToListAsync();
        }

        public async Task<bool> EditPostAsync(Guid postId, string userId, PostCreateDto dto, IFormFile[]? images, string webRootPath, bool byEditor = false)
        {
            var p = await _postRepo.GetByIdAsync(postId);
            if (p == null) return false;

            // If user editing their own post -> put in PendingApproval.
            // If editor editing (byEditor==true) -> apply change immediately and mark ApprovedBy.
            if (!byEditor && p.AuthorId != userId) return false;

            p.Title = dto.Title;
            p.Content = dto.Content;
            p.UpdatedAt = DateTime.UtcNow;
            p.Status = byEditor ? PostStatus.Published : PostStatus.PendingApproval;

            if (images != null && images.Length > 0)
            {
                // remove existing images
                var oldImgs = _db.PostImages.Where(i => i.PostId == p.Id).ToList();
                foreach (var oi in oldImgs) _db.PostImages.Remove(oi);

                var uploadDir = Path.Combine(webRootPath, "Uploads");
                Directory.CreateDirectory(uploadDir);
                int order = 0;
                foreach (var file in images)
                {
                    if (file.Length <= 0) continue;
                    var ext = Path.GetExtension(file.FileName);
                    var fileName = $"{Guid.NewGuid()}{ext}";
                    var savePath = Path.Combine(uploadDir, fileName);
                    using (var fs = new FileStream(savePath, FileMode.Create))
                    {
                        await file.CopyToAsync(fs);
                    }
                    var url = $"/Uploads/{fileName}";
                    p.Images.Add(new PostImage { Id = Guid.NewGuid(), FileName = fileName, Url = url, SortOrder = order++ });
                }
            }

            _postRepo.Update(p);
            await _postRepo.SaveAsync();
            return true;
        }

        public async Task<bool> ApprovePostAsync(Guid postId, string editorId)
        {
            var p = await _postRepo.GetByIdAsync(postId);
            if (p == null) return false;
            p.Status = PostStatus.Published;
            p.ApprovedById = editorId;
            p.UpdatedAt = DateTime.UtcNow;
            _postRepo.Update(p);
            await _postRepo.SaveAsync();
            return true;
        }
        // PostService.cs
        public async Task<bool> RejectPostAsync(Guid postId, string editorId)
        {
            var post = await _postRepo.GetByIdAsync(postId);
            if (post == null) return false;

            post.Status = PostStatus.Rejected;
            post.ApprovedById = editorId; // optional: track who rejected
            post.UpdatedAt = DateTime.UtcNow;

            _postRepo.Update(post);
            await _postRepo.SaveAsync();
            return true;
        }
        // Implementation

        public async Task<Post?> GetByIdAsync(Guid postId, string? currentUserId = null)
        {
            return await _postRepo.Query()
         .Include(p => p.Author)
         .Include(p => p.Images)
         .Include(p => p.Comments)
         .Include(p => p.Likes)
         .Include(p => p.Views)
         .FirstOrDefaultAsync(p => p.Id == postId && (p.Status == PostStatus.Published || p.AuthorId == currentUserId));
        }
        public async Task SubmitEditForApprovalAsync(Post post, PostEditDto dto)
        {
            var pendingEdit = new PendingPost
            {
                OriginalPostId = post.Id,
                Title = dto.Title,
                Content = dto.Content,
                AuthorUsername = post.Author!.UserName,
                CreatedAt = DateTime.UtcNow,
                Status = PostStatus.PendingApproval,
                Images = new List<PendingPostImage>()
            };

            int sortOrder = 0; // 👈 keeps track of image order

            // Handle new images
            if (dto.NewImages != null && dto.NewImages.Any())
            {
                foreach (var file in dto.NewImages)
                {
                    var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                    var filePath = Path.Combine(_webHostEnvironment.WebRootPath, "Uploads", fileName);

                    using var stream = new FileStream(filePath, FileMode.Create);
                    await file.CopyToAsync(stream);

                    pendingEdit.Images.Add(new PendingPostImage
                    {
                        Url = "/Uploads/" + fileName,
                        FileName = file.FileName,   // original filename from user
                        SortOrder = sortOrder++     // assign order
                    });
                }
            }

            // Handle existing images
            if (dto.ExistingImages != null && dto.ExistingImages.Any())
            {
                foreach (var url in dto.ExistingImages)
                {
                    var fileName = Path.GetFileName(url); // extract filename from URL
                    pendingEdit.Images.Add(new PendingPostImage
                    {
                        Url = "/Uploads/" + fileName,
                        FileName = fileName,        // store filename for consistency
                        SortOrder = sortOrder++     // continue ordering
                    });
                }
            }

            await _db.PendingPosts.AddAsync(pendingEdit);
            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<Post>> GetPublishedAsync(int page = 1, int pageSize = 20)
        {
            // Fetch all published posts ordered by CreatedAt descending
            var allPosts = await _postRepo.Query()
                .Where(p => p.Status == PostStatus.Published)
                .Include(p => p.Author)
                .Include(p => p.Images)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(); // fetch everything first

            // Apply pagination in memory to avoid OFFSET/FETCH
            var pagedPosts = allPosts
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return pagedPosts;
        }

        public async Task<bool> DeletePostAsync(Guid postId, string userId)
        {
            var post = await _postRepo.Query()
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == postId && p.AuthorId == userId);

            if (post == null) return false;

            // Delete images physically if needed
            foreach (var img in post.Images)
            {
                var path = Path.Combine(_webHostEnvironment.WebRootPath, "Uploads", img.FileName);
                if (File.Exists(path)) File.Delete(path);
            }

            _postRepo.Remove(post);
            await _postRepo.SaveAsync();
            return true;
        }


        public async Task ToggleLikeAsync(Guid postId, string userId)
        {
            var existing = await _db.PostLikes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
            if (existing != null)
            {
                _db.PostLikes.Remove(existing);
            }
            else
            {
                _db.PostLikes.Add(new PostLike { Id = Guid.NewGuid(), PostId = postId, UserId = userId });
            }
            await _db.SaveChangesAsync();
        }

        public async Task AddViewAsync(Guid postId, string? userId, string? ip)
        {
            _db.PostViews.Add(new PostView { Id = Guid.NewGuid(), PostId = postId, UserId = userId, IpAddress = ip, ViewedAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
        }
        public async Task<CommentResponseDto> AddCommentAsync(Guid postId, string authorId, string content, Guid? parentId = null)
        {
            var comment = new PostComment
            {
                Id = Guid.NewGuid(),
                PostId = postId,
                AuthorId = authorId,
                Content = content,
                ParentCommentId = parentId,
                CreatedAt = DateTime.UtcNow
            };

            _db.PostComments.Add(comment);
            await _db.SaveChangesAsync();

            // 🔑 Fetch author name to fill DTO
            var author = await _db.Users.FirstOrDefaultAsync(u => u.Id == authorId);

            return new CommentResponseDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                AuthorId = authorId,
                AuthorName = author?.DisplayName ?? author?.UserName ?? string.Empty,
                ParentCommentId = parentId
            };
        }

        public async Task<IEnumerable<CommentResponseDto>> GetCommentsAsync(Guid postId)
        {
            return await _db.PostComments
                .Where(c => c.PostId == postId)
                .Include(c => c.Author)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentResponseDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    AuthorId = c.AuthorId,
                    AuthorName = c.Author!.DisplayName ?? c.Author.UserName ?? string.Empty,
                    ParentCommentId = c.ParentCommentId
                })
                .ToListAsync();
        }
        public async Task<IEnumerable<Post>> GetUserTopPostsAsync(string userId)
        {
            return await _postRepo.Query()
                .Where(p => p.AuthorId == userId && p.Status == PostStatus.Published)
                .Include(p => p.Images)
                .OrderByDescending(p => p.Views.Count)  // or Likes.Count if you prefer
                .Take(5)  // top 5 posts
                .ToListAsync();
        }
        public async Task<Post?> GetByIdAsyncForEditor(Guid postId)
        {
            return await _postRepo.Query()
                .Include(p => p.Author)
                .Include(p => p.Images)
                .Include(p => p.Comments)
                .Include(p => p.Likes)
                .Include(p => p.Views)
                .FirstOrDefaultAsync(p => p.Id == postId);
        }


    }
}
       