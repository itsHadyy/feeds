import React, { useState } from "react";

// Define the Comment interface
interface Comment {
    text: string;
    timestamp: Date;
}

// Update CommentsProps to use the Comment interface
interface CommentsProps {
    comments: Comment[];
    onAddComment: (comment: string) => void;
    onDeleteComment: (commentIndex: number) => void;
}

const Comments: React.FC<CommentsProps> = ({ comments, onAddComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState("");

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment("");
        }
    };

    return (
        <div className="comments-section">
            <div className="comments-list">
                {comments.map((comment, index) => (
                    <div key={index} className="comment">
                        <span className="comment-text">{comment.text}</span>
                        <span className="comment-timestamp">
                            {comment.timestamp.toLocaleString()}
                        </span>
                        <button
                            className="delete-comment"
                            onClick={() => onDeleteComment(index)}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            <div className="add-comment">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                />
                <button onClick={handleAddComment}>Add Comment</button>
            </div>
        </div>
    );
};

export default Comments;