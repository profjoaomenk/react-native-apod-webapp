import './App.css';
import 'isomorphic-fetch';
import { useState } from "react";
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import enLocale from 'date-fns/locale/en-GB';
import DatePicker from '@mui/lab/DatePicker';
import { format, isWithinInterval } from 'date-fns';

function App() {
  const [apod, setApod] = useState([]);
  const [userDate, setUserdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorState, setErrorstate] = useState(null);

  // Earliest photo in APOD
  const apodEarliest = new Date(1995,5,16); 
  // Latest photo in APOD, ie today
  // Hours set to midnight to ensure user selection of date+time always before this date
  const apodLatest = new Date().setHours(23,59,59); 

  //NASA API URL
  const url = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.REACT_APP_NASA_API_KEY + "&date=";

  // Fetches photo from NASA API
  const fetchPost = async (uDate) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(
        url + uDate
      );
      if (response.status >= 400) {
        setErrorstate(response.status);
        hasError(true);
      }
      const data = await response.json();
      setApod(data);
    } catch (error) {
      setHasError(true);
    }
    setIsLoading(false);
  };

  // Sets userDate as today if null
  // e.g. loads today's photo on first render
  if (!userDate) {
    setUserdate(new Date());
    fetchPost(format(new Date(), 'yyyy-MM-dd'));
  }

  // Adjusts HTML for image vs video
  function MediaType(media) {
    var mediaLink;
    // Determines whether APOD picture is image or video
    if(media === "image") {
      mediaLink = <img src={apod.url} alt={apod.title}/>;
    } else {
      mediaLink = <iframe title={apod.title} src={apod.url} allowFullScreen> </iframe>;
    }
    return (
      <>
        {mediaLink}
        <p><strong>{apod.title}</strong></p>
        <p>{apod.explanation}</p>
        <p>Copyright: { apod.copyright ? apod.copyright : "NASA (Public Domain)" }</p>
      </>
    );
  }

  // Component that serves photo, with error handling
  function Picture() {
    // Return if server has error
    if (hasError) {
      return (
        <p className="userMsg">Error connecting to server. 
          <br/>
          Server response: {errorState}</p>
      );
    }
    // Return when waiting for API
    else if(isLoading) {
      return <p className="userMsg">Loading...</p>;
    }
    // Return once user has selected date and no longer loading and no error
    else if(userDate) {
      return MediaType(apod.media_type);
    }
    // Default return if date not chosen or no error
    // This should never return: userDate is set as today if null on load
    return <p className="userMsg">Select a date between 16-Jun-1995 and today</p>;
  }

  return (
    <>
      <h1>NASA Astronomy Picture of the Day Picker</h1>
      <div className="datepicker">
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
          <DatePicker 
            minDate={apodEarliest}
            maxDate={apodLatest}
            value={userDate}
            onChange={(newDate) => {
              if (isWithinInterval(
                newDate,
                {start: apodEarliest, end: apodLatest })) {
                setUserdate(newDate);
                fetchPost(format(new Date(newDate), 'yyyy-MM-dd'));
              };
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </div>
      <Picture />
      <p className="footer"><a href="https://apod.nasa.gov/apod/lib/about_apod.html">About NASA's Astronomy Picture of the Day</a></p>
      <p className="footer">This page is part of the web development tutorial: <br/> <a href="https://www.preciouschicken.com/blog/posts/azure-react-apod/">Étoile du jour: Deploying a React Web App on the Microsoft Azure Cloud</a></p>
    </>
  );
}

export default App;
