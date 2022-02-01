import '../form.css';
import axios from 'axios';
import React, { Component, useState } from 'react';
import env from "react-dotenv";
var CryptoJS = require("crypto-js");
const FormData = require('form-data');

function Form() {

  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const onVideoChange = event => {
    setSelectedVideoFile(event.target.files[0]);
  };

  const onTitleChange = event => {
    setTitle(event.target.value)
  }

  const onImageChange = event => {
    setSelectedImageFile(event.target.files[0]);
  };

  const onDescriptionChange = event => {
    setDescription(event.target.value)
  }

  const onContentChange = event => {
    setContent(event.target.value)
  }

  const onFileUpload = () => {

    const pinVideoFileToIPFS = async (pinataApiKey, pinataSecretApiKey) => {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      let data = new FormData();
      data.append('file', selectedVideoFile);

      const metadata = JSON.stringify({
        name: title,
        description: description,
        content: content,
      });
      data.append('pinataMetadata', metadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 1
            },
            {
              id: 'NYC1',
              desiredReplicationCount: 2
            }
          ]
        }
      });
      data.append('pinataOptions', pinataOptions);

      const result = axios
        .post(url, data, {
          maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
          headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        })
        .then(function (response) {
          console.log(response)
          return 'https://ipfs.io/ipfs/' + response.data.IpfsHash
        })
        .catch(function (error) {
          console.log(error)
        });

      return result
    };

    const pinImageFileToIPFS = async (pinataApiKey, pinataSecretApiKey) => {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      let data = new FormData();
      data.append('file', selectedImageFile);

      const metadata = JSON.stringify({
        name: title,
        description: description,
        content: content,
      });
      data.append('pinataMetadata', metadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 1
            },
            {
              id: 'NYC1',
              desiredReplicationCount: 2
            }
          ]
        }
      });
      data.append('pinataOptions', pinataOptions);

      const result = axios
        .post(url, data, {
          maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
          headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        })
        .then(function (response) {
          console.log(response)
          return 'https://ipfs.io/ipfs/' + response.data.IpfsHash
        })
        .catch(function (error) {
          console.log(error)
        });

      return result
    };

    const pinJSONToIPFS = (pinataApiKey, pinataSecretApiKey, JSONBody) => {
      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
      return axios
        .post(url, JSONBody, {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        })
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          //handle error here
        });
    };

    async function main() {
      const ipfsVideoUrl = await pinVideoFileToIPFS(env.PINATA_KEY, env.PINATA_SECRET_KEY)
      const ipfsImageUrl = await pinImageFileToIPFS(env.PINATA_KEY, env.PINATA_SECRET_KEY)
      const dataJson = {
        'ipfs_video_url': ipfsVideoUrl,
        'ipfs_backgroung_url': ipfsImageUrl,
        'metadata': {
          'title': title,
          'description': description,
          'content': content
        }
      }
      var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(dataJson), 'secret key 123').toString();
      console.log(ciphertext)
      pinJSONToIPFS(env.PINATA_KEY, env.PINATA_SECRET_KEY, ciphertext)
    }

    main();
  };

  const fileData = () => {

    if (selectedVideoFile) {

      return (
        <div>
          <h2>File Details:</h2>

          <p>File Name: {selectedVideoFile.name}</p>


          <p>File Type: {selectedVideoFile.type}</p>


          <p>
            Last Modified:{" "}
            {selectedVideoFile.lastModifiedDate.toDateString()}
          </p>

        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose before Pressing the Upload button</h4>
        </div>
      );
    }
  };

  return (
    <div>
      <h1>
        Web3 Udemy
      </h1>
      <h3>
        Create your first course!
      </h3>
      <div>
        <label>Title</label>
        <input type="text" value={title} onChange={onTitleChange}></input>
        <label>Upload your video content</label>
        <input type="file" onChange={onVideoChange} />
        <label>Description</label>
        <input type="text" value={description} onChange={onDescriptionChange}></input>
        <label>Upload a background image</label>
        <input type="file" onChange={onImageChange} />
        <label>Content</label>
        <input id="textarea" type="textarea" value={content} onChange={onContentChange}></input>
        <br />
        <button onClick={onFileUpload}>
          Upload!
        </button>
      </div>
      {fileData()}
    </div>
  );
}

export default Form;