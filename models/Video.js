export class Video {
  constructor(title, description, videoUrl, thumbnailUrl, tags, userId, username) {
    this.title = title;
    this.description = description;
    this.videoUrl = videoUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.tags = tags || [];
    this.userId = userId;
    this.username = username;
    this.views = 0;
    this.likes = 0;
    this.shares = 0;
    this.createdAt = new Date();
  }
}