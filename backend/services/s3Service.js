const AWS = require('aws-sdk');
const { aws } = require('../config/aws-config');
const uuid = require('uuid');

// Configure AWS
AWS.config.update({
  region: aws.region,
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey
});

const s3 = new AWS.S3();

const uploadFile = async (file, folder) => {
  const fileExtension = file.name.split('.').pop();
  const key = `${folder}/${uuid.v4()}.${fileExtension}`;
  
  const params = {
    Bucket: aws.s3.bucketName,
    Key: key,
    Body: file.data,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (err) {
    console.error('S3 Upload Error:', err);
    throw err;
  }
};

const deleteFile = async (fileUrl) => {
  const key = fileUrl.split('/').slice(3).join('/');
  
  const params = {
    Bucket: aws.s3.bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (err) {
    console.error('S3 Delete Error:', err);
    throw err;
  }
};

module.exports = {
  uploadFile,
  deleteFile
};