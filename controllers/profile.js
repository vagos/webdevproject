const db = require('./db');

exports.getUserObject = async (id) => {
   
    const activities = await db.query(`SELECT * FROM participation JOIN activity
    ON participation.activity = activity.id
    WHERE participation.user = ?`, id);

    const friends = await db.query(`SELECT user.id, name FROM friendship JOIN
    user ON user_second = user.id
    WHERE user_first = ?`, [id, id]);

    const info = await db.queryOne(`SELECT name, join_date, bio FROM user WHERE id = ?`, id);

    const comments = await db.query(`SELECT DATE_FORMAT(comment.creation_time, "%M %d %Y") as creation_time, post.id as
    postId, post.name as postName FROM comment JOIN post ON comment.post =
        post.id 
        WHERE comment.creator = ? ORDER BY comment.creation_time ASC LIMIT 5`,
        id);
    // console.log(comments)

    const posts = await db.query(`
    SELECT post.id, post.name, DATE_FORMAT(post.creation_time, "%M %d %Y")
    as creation_time 
    FROM post 
     WHERE post.creator = ? ORDER BY post.creation_time ASC LIMIT 5`, id);
    
    user = {
        'name': info.name,
        'id': id,
        'bio': info.bio,
        'activities': activities,
        'friends' : friends,
        'comments' : comments,
        'posts' : posts,
    };

    return user;
};

exports.changeUserBio = async (id, bio) => {
    
    db.query(`UPDATE user SET bio = ?
    WHERE user.id = ?`, [bio, id]);
};

exports.getUserStats = async (id) => {

    comments_per_month = await db.query(`SELECT COUNT(*) as cnt, 
    DATE_FORMAT(comment.creation_time, '%m') as month
    FROM comment WHERE comment.creator = ? 
            GROUP BY month
            ORDER BY month
        `, [id]);

    posts_per_month = await db.query(`SELECT COUNT(*) as cnt, 
    DATE_FORMAT(post.creation_time, '%m') as month
    FROM post WHERE post.creator = ? 
            GROUP BY month
            ORDER BY month
        `, [id]);

    activity_participation = await db.query(`SELECT activity.name, COUNT(*) as points
        FROM post JOIN activity ON post.activity = activity.id WHERE creator =
        ? GROUP BY post.activity;`, [id]);

    return {
        comments: comments_per_month,
        posts: posts_per_month,
        participation: activity_participation,
    };
};

// This will check if the first user has the second user as a friend
exports.isFriend = async function (firstUser, secondUser) { 

    let result = await db.queryOne(`SELECT * FROM friendship
        WHERE user_first = ?
        AND user_second = ?`,[firstUser,secondUser]);

    // console.log("Result:",result);

    // if first user has the second user as a friend
    if (result.length !=0) return true;
    else return false;

};

// Takes first user and adds second user as a friend
exports.addFriend = async function (firstUser, secondUser) {

    // check constraints 

    // try to insert data if it passes constraint

    let temp = await db.query(`INSERT INTO friendship(user_first, user_second) VALUES(?, ?)`, [firstUser, secondUser]);


    // console.log("made friend");

};
