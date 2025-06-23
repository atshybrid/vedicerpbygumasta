const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadToS3 = async (
  path,
  awsPath,
  file,
  contentType = "application/json"
) => {
  let fileStream;

  if (path) {
    fileStream = fs.createReadStream(path);
  }

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Body: fileStream || file,
    Key: awsPath,
    ContentType: contentType,
  };

  const response = await s3.upload(uploadParams).promise();
  console.log(response, "data");
  return response;
};

module.exports = { uploadToS3 };
