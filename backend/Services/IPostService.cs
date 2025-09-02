using BlogApi.DTOs.Comments;
using BlogApi.DTOs.Posts;
using BlogApi.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic; 
using System.Linq;
using System.Threading.Tasks;

namespace BlogApi.Services
{
    public interface IPostService
    {
        Task<Post> CreatePostAsync(string authorId, PostCreateDto dto, IFormFile[]? images, string webRootPath);
        Task<List<Post>> GetPendingPostsAsync();

        Task<bool> EditPostAsync(Guid postId, string userId, PostCreateDto dto, IFormFile[]? images, string webRootPath, bool byEditor = false);
        Task<bool> ApprovePostAsync(Guid postId, string editorId);
        Task<bool> RejectPostAsync(Guid postId, string editorId);
        Task<Post?> GetByIdAsync(Guid postId, string? currentUserId = null);
        Task<IEnumerable<Post>> GetPublishedAsync(int page = 1, int pageSize = 20);
        Task ToggleLikeAsync(Guid postId, string userId);
        Task AddViewAsync(Guid postId, string? userId, string? ip);


        Task<CommentResponseDto> AddCommentAsync(Guid postId, string userId, string content, Guid? parentCommentId);
        Task<IEnumerable<CommentResponseDto>> GetCommentsAsync(Guid postId);



        Task<Post?> GetByIdAsyncForEditor(Guid postId);

        Task SubmitEditForApprovalAsync(Post post, PostEditDto dto);

        Task<IEnumerable<Post>> GetUserTopPostsAsync(string userId);

        Task<bool> DeletePostAsync(Guid postId, string userId);
    }
}
