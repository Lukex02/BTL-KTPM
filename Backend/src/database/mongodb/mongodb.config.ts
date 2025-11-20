export default () => ({
  mongo: {
    uri:
      process.env.MONGO_URI ||
      'mongodb+srv://db-ktpm:Lf8MdrDPAIiaooNy@main.hjvq3wy.mongodb.net/?appName=main',
    dbName: process.env.MONGO_DB || 'ITS',
  },
});
