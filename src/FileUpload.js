import OpenAI from 'openai-api';
import env from "react-dotenv";

import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './Toolbar';
import './FileUpload.css';
import img from './image/Upload.png';
import paste from './image/UploadResume.png';
import upload from './image/Paste.png';
import ResumeUploadboxIcon from './image/ResumeUploadboxIcon.png';

import mammoth from "mammoth/mammoth.browser.js";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

import myTemplate from "./assets/ResumeTemplate.docx";

function FileUpload() {

  const [beforeConversionResponse, setBeforeConversionResponse] = useState('')
  const [afterConversionResponse, setAfterConversionResponse] = useState('')

  const [selectedFile, setSelectedFile] = useState('');
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [uploadStepActive, setUploadStepActive] = useState(true);
  const [pasteStepActive, setPasteStepActive] = useState(false);
  const [jobDescription, setJobDescription] = useState(''); //  This basicallu holds the users job description input

  const [tailoredResumeReady, setTailoredResumeReady] = useState(false);
  const [loadingResumeData, setLoadingResumeData] = useState(false);
  const [loadingTailor, setLoadingTailor] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);

  const [parsedWordFile, setParsedWordFile] = useState('')
  const [parsedJSONData, setParsedJSONData] = useState({})

  useEffect(() => {
    if(parsedWordFile !== ''){
        aiResumeData()
    }
  }, [parsedWordFile])
  
  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleFileChange = (event) => {
    console.log('File Uploaded');
    setSelectedFile(event.target.files[0]);
    setLoadingResumeData(true);
    //Read a .docx file
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            await mammoth.extractRawText({arrayBuffer: event.target.result})
            .then(function(result){
                const text = result.value; // The raw text
                console.log('File Upload Response: ' + text);
                setParsedWordFile(text)
            })
            .catch(function(error){
                console.log(error)
            })
        } catch (error) {
            console.log(error)
        }
    }
    reader.readAsArrayBuffer(event.target.files[0])
    setShowJobDescription(true);
    document.querySelector('.button-container').classList.add('show'); // Add this line
  };

  
  const parseToJSON = (resumeData) => {
    return JSON.parse(resumeData)
  }

  const tailorResumeToJobDescription = async (parsedJSONData, jobDescription) => {
    const API_URL = env.OPEN_AI_API;
    const openai = new OpenAI(API_URL);
  
    // Prompt the language model to generate a score for each experience section
    const scores = await Promise.all(
      parsedJSONData.Experience.map(async (exp) => {
        const prompt = `STRICTLY give this experience section a score from 0 to 100 based on how well it matches this job description, STRICTLY output ONLY the score number: ${jobDescription} \n\n ${exp.responsibilities.join('\n')}`;
        const response = await openai.complete({
          engine: 'text-davinci-003',
          prompt: prompt,
          max_tokens: 400,
          temperature: 0.3,
        });
        return parseFloat(response.data.choices[0].text);
      })
    );
  
    //Adjust the each responsibility tailored to the job description
    const adjustedResponsibilities = await Promise.all(
      parsedJSONData.Experience.map(async (exp) => {
        //for every responsibility in the experience section promt the language model to adjust the responsibility
        const adjustedResponsibilities = await Promise.all(
          exp.responsibilities.map(async (responsibility) => {
            const prompt = `STRICTLY change the wording of my resume responsibility section SLIGHTLY. DO NOT add anything extra to the responsibility! \nhere is the Responsibility: ${responsibility} \n\nTo better match this job description: ${jobDescription}. \n\nOutput ONLY the revised responsibility. DO NOT add any extra sentences! DO NOT say "Responsibility:" or "Job Description:".`;
            const response = await openai.complete({
              engine: 'text-davinci-002',
              prompt: prompt,
              max_tokens: 1000,
              temperature: 0.2,
            });
            return response.data.choices[0].text.trim();
          })
        );
        return {
          ...exp,
          responsibilities: adjustedResponsibilities,
        };
      })
    );
  
    // Assign the scores to the corresponding experience sections
    adjustedResponsibilities.forEach((exp, i) => {
      exp.score = scores[i];
    });
  
    // Sort the experience sections by score, in descending order
    adjustedResponsibilities.sort((a, b) => b.score - a.score);
  
    // Return the sorted parsedJSONData
    return { ...parsedJSONData, Experience: adjustedResponsibilities };
  };

  const aiResumeData = useCallback(() => {
      const API_URL = env.OPEN_AI_API
      const openai = new OpenAI(API_URL)
      console.log("Getting response from OpenAI...");
      const getResponse = async () => {
          const gptResponse = await openai.complete({
              engine: 'text-davinci-003',
              prompt: `Can you parse this information to a JSON list. The JSON list must STRICTLY follow this format: { "PersonalInfo": [{ "name":"", "email":"", "phone":"", "location":"", }], "Objective": "", "Education": [{ "degree":"", "school":"", "graduationDate": "", "gpa": "" }, ], "Experience": [{ "jobTitle":"", "company":"", "startDate":"", "responsibilities": ["",] }], "skills": ["",], "projects":[{ "projectName":"", "description":["",], "startDate":"", "endDate":"", "technologies":["",] }], "Certifications":[{ "name":"", "company":"", "number":"", "startDate":"", "endDate":"" }] Here is the Data that needs to be parsed:  ${parsedWordFile} }`,
              max_tokens: 2500,   //100 TOKENS = ~75 WORDS
              temperature: 0.3,   //Was 0.7 chose 0.3 because it was more accurate
          })
          console.log('Needs to be parsed: \n' + parsedWordFile);
          console.log('Parsed Information:\n'+ gptResponse.data.choices[0].text);
          console.log('JSON Converted Information:\n', parseToJSON(gptResponse.data.choices[0].text)); //Display the JSON data
          setParsedJSONData(parseToJSON(gptResponse.data.choices[0].text)) //Set the JSON data to the state
          setBeforeConversionResponse(gptResponse.data.choices[0].text)
          setLoadingResumeData(false);
          return gptResponse.data.choices[0].text
      }
    getResponse()
  }, [parsedWordFile])

  const handleTailorResume = async () => {
    setLoadingTailor(true)
    await tailorResumeToJobDescription(parsedJSONData, jobDescription).then((result) => {   
      console.log('Tailored Resume: \n', result)
      setAfterConversionResponse(result)
      setTailoredResumeReady(true)
      setShowDownloadButton(true)
    });
    setLoadingTailor(false)
  }

  const generateResume = async () => {
      if (!selectedFile && !jobDescription) {
        alert('Please select a file first.');
        return;
      } else {
        console.log("Generating Resume...");
        console.log("Location of myTemplate: ", myTemplate);
        const response = await fetch(myTemplate)
        const templateContent = await response.arrayBuffer()
        const doc = new Docxtemplater()
        const zip = new PizZip(templateContent)
        doc.loadZip(zip)
        doc.setData(afterConversionResponse)
        doc.render()
        const out = doc.getZip().generate({ type: "blob" })
        saveAs(out, "resume.docx")
      }
  }
  /*
  Job Qualifications:
• Bachelor's or Master's degree in Computer Science, Electronics Engineering or related field or equivalent experience.
• Proficient in C, C++, Python, Perl programming, and hands-on experience writing object-oriented code using either of the technologies.
• Candidate with automation development experience on Linux, Android, FreeRTOS, Windows etc
• Prior experience in APP development on Android & iOS is added advantage
• Familiarity and experience with various technologies like RESTful API, JSON, Front end - Angular, Backend - Node JS, DB - Mongodb is added advantage
• Exposure to embedded SW development is desirable
• Structured and analytical working method
• Excellent communication and interpersonal skills. Strong written and verbal communications including the ability to document test plans, test results and to interpret test results into actionable recommendations.
• Take initiative, be proactive and assume full responsibility of the tasks and initiatives
*/

  return (
    <div className="main-container">
      <Toolbar />

      <div className="content">
        <div className="right-section">
          <img src={img} alt="Illustration" className="front-page-image" />
          {jobDescription && (     
          <div className={`button-container ${showJobDescription ? "show" : ""}`}>
            {loadingTailor ? ( <button className={`ai-optimized-button`}>Loading...</button> )
            : ( <> {!showDownloadButton ? (<button className={`ai-optimized-button`} onClick={handleTailorResume}>Tailor Resume</button>) : (<button className={`ai-optimized-button`} onClick={generateResume}>Download Tailored Resume</button>)} </> )}
          </div>
          )}
        </div>
        <div className="left-container">
          <div className="left-content">
            <div className="steps-box">
              <div className="steps">
                <div className="step">
                  <div className={`step1-icon-bg ${selectedFile ? "inactive" : ""}`}></div>
                  <img src={upload} alt="Upload resume icon" className={`step-icon step1-icon ${selectedFile ? "inactive" : ""}`} />
                  <span className="step-text">Upload resume</span>
                </div>
                <div className="step-line"></div>
                <div className="step">
                  <div className={`step2-icon-bg ${showJobDescription ? "active" : ""}`}></div>
                  <img src={paste} alt="Paste/select icon" className={`step-icon step2-icon ${showJobDescription ? "" : "inactive"}`} />
                  <span className="step-text">Paste or select</span>
                </div>
              </div>
            </div>
            <div className="left-section">
              <img src={ResumeUploadboxIcon} alt="Resume Upload Icon" className="resume-upload-icon" />
              <form className="upload-form">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              </form>
              {loadingResumeData && <h1>Loading...</h1>}
              {!loadingResumeData && showJobDescription && (
                <div className={`job-description ${showJobDescription ? "show" : ""}`}>
                  <h2>Enter Job Description:</h2>
                  <textarea
                    className="job-description-text"
                    rows="10"
                    cols="30"
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                  ></textarea>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
