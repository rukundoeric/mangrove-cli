module.exports = mangrove => {
  const User = mangrove.define("User",
  {
    firstName: mangrove.DataTypes.STRING,
    lastName: mangrove.DataTypes.STRING,
    Email: mangrove.DataTypes.STRING,
  }
  ); 
  
  const Comment = sequelize.define(
    'Comment',
    {
      comment: DataTypes.STRING,
      slug: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      articleId: DataTypes.INTEGER,
      commentId: DataTypes.INTEGER
    },
    {}
  );
  return User;
};
