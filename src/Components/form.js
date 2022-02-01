import '../form.css';
import axios from 'axios';
import React, { Component, useState } from 'react';
import env from "react-dotenv";
const FormData = require('form-data');

function Form() {

  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const onFileChange = event => {
    setSelectedFile(event.target.files[0]);
  };

  const onTitleChange = event => {
    setTitle(event.target.value)
  }

  const onDescriptionChange = event => {
    setDescription(event.target.value)
  }

  const onContentChange = event => {
    setContent(event.target.value)
  }

  const onFileUpload = () => {
    const formData = new FormData();

    const pinFileToIPFS = (pinataApiKey, pinataSecretApiKey) => {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      let data = new FormData();
      data.append('file', selectedFile);

      const metadata = JSON.stringify({
        name: title,
        description: description,
        content: content,
        keyvalues: {
          exampleKey: 'exampleValue'
        }
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

      axios
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
          return response.data.IpfsHash
        })
        .catch(function (error) {
          console.log(error)
        });
    };
    pinFileToIPFS(env.PINATA_KEY, env.PINATA_SECRET_KEY)
  };

  const fileData = () => {

    if (selectedFile) {

      return (
        <div>
          <h2>File Details:</h2>

          <p>File Name: {selectedFile.name}</p>


          <p>File Type: {selectedFile.type}</p>


          <p>
            Last Modified:{" "}
            {selectedFile.lastModifiedDate.toDateString()}
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
        <input type="file" onChange={onFileChange} />
        <label>Description</label>
        <input type="text" value={description} onChange={onDescriptionChange}></input>
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