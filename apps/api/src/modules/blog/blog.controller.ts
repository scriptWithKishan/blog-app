type Request = import("express").Request;
type Response = import("express").Response;

const Blog = require("../../models/blog");
const User = require("../../models/user");
const BlogView = require("../../models/blog-view");

const extractUserId = (req: Request) => {
  if (!req.user) return null;
  return typeof req.user === "object"
    ? req.user.user || req.user.id || req.user._id
    : req.user;
};

const getUserBlogs = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalBlogs / limit) || 1;

    const blogs = await Blog.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "User blogs fetched successfully!",
      blogs,
      totalPages,
      currentPage: page,
      totalBlogs,
    });
  } catch (err: any) {
    console.error("Internal server error! ", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
};

const postUserBlog = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const { head, body } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    await Blog.create({
      user: userId,
      head,
      body,
    });

    return res.status(200).json({
      message: "Blog created successfully!",
    });
  } catch (err: any) {
    console.log("Internal server error", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const subscribedBloggersBlogList = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    const blogs = await Blog.find({ user: { $in: user.subscribedBloggers } })
      .sort({ createdAt: -1 })
      .populate("user", "username");

    return res.status(200).json({
      message: "Subscribed bloggers blog list fetched successfully!",
      blogs,
    });
  } catch (err: any) {
    console.log("Internal server error", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
};

const getPopularBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.aggregate([
      // Lookup views count from blogviews collection
      {
        $lookup: {
          from: "blogviews",
          localField: "_id",
          foreignField: "blog",
          as: "viewsList",
        },
      },
      // Calculate counts and popularity score: (Likes * 3) + (Views * 1)
      {
        $addFields: {
          viewsCount: { $size: "$viewsList" },
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          popularityScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 3] },
              { $size: "$viewsList" },
            ],
          },
        },
      },
      {
        $project: {
          viewsList: 0,
        },
      },
      // Sort by popularity score descending
      {
        $sort: {
          popularityScore: -1,
          createdAt: -1,
        },
      },
      // Populate user info
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          "user.password": 0,
          "user.email": 0,
        },
      },
    ]);

    return res.status(200).json({
      message: "Popular blogs fetched successfully!",
      blogs,
    });
  } catch (err: any) {
    console.error("Error in getPopularBlogs:", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
};

const toggleLikeBlog = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const blogId = req.params.id || req.body.blogId;

    if (!blogId) {
      return res.status(400).json({ message: "Blog ID is required!" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    const isLiked = blog.likes?.some(
      (id: any) => id.toString() === userId.toString()
    );

    if (isLiked) {
      await Blog.findByIdAndUpdate(blogId, { $pull: { likes: userId } });
    } else {
      await Blog.findByIdAndUpdate(blogId, { $addToSet: { likes: userId } });
    }

    const updatedBlog = await Blog.findById(blogId);

    return res.status(200).json({
      message: isLiked ? "Blog unliked successfully!" : "Blog liked successfully!",
      isLiked: !isLiked,
      likesCount: updatedBlog.likes ? updatedBlog.likes.length : 0,
    });
  } catch (err: any) {
    console.error("Error in toggleLikeBlog:", err.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const recordBlogView = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const blogId = req.params.id || req.body.blogId;

    if (!blogId) {
      return res.status(400).json({ message: "Blog ID is required!" });
    }

    await BlogView.updateOne(
      { blog: blogId, user: userId },
      { $setOnInsert: { blog: blogId, user: userId } },
      { upsert: true }
    );

    return res.status(200).json({
      message: "Blog view recorded successfully!",
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(200).json({ message: "Blog view already recorded!" });
    }
    console.error("Error in recordBlogView:", err.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const getBlogById = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId).populate("user", "username email");

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found!",
      });
    }

    const viewsCount = await BlogView.countDocuments({ blog: blogId });
    const likesCount = blog.likes ? blog.likes.length : 0;
    const isLiked = userId
      ? blog.likes?.some((id: any) => id.toString() === userId.toString())
      : false;

    return res.status(200).json({
      message: "Blog fetched successfully!",
      blog: {
        ...blog.toObject(),
        viewsCount,
        likesCount,
        isLiked,
      },
    });
  } catch (err: any) {
    console.error("Internal server error!", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
};

module.exports = {
  getUserBlogs,
  postUserBlog,
  subscribedBloggersBlogList,
  getPopularBlogs,
  toggleLikeBlog,
  recordBlogView,
  getBlogById,
};



