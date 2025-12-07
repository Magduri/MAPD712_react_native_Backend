let SERVER_NAME = 'user-api'
let PORT = 3000;
let HOST = '127.0.0.1';
//let HOST = '0.0.0.0';

const mongoose = require ("mongoose");
const username = "iamagduri_db_user";
const password = "<Your_Password>";
const dbname = "mapd713db";

let uristring = 'mongodb+srv://'+username+':'+password+'@cluster0.msyoabw.mongodb.net/'+
 dbname+'?retryWrites=true&w=majority';

// Makes db connection asynchronously
mongoose.connect(uristring, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', ()=>{
  // we're connected!
  console.log("!!!! Connected to db: " + uristring)
});

const patientsSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dob: String,
  gender: String,
  phone: String,
  email: String,
  address: String, 
});

//ClinicalData schema and model
const clinicalDataSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Patients',required: true},
  type: {type: String, required: true},
  value: {type: mongoose.Schema.Types.Mixed, required: true},

  systolic: { type: Number, required: false },
  diastolic: { type: Number, required: false },
  classification: { type: String, enum: ['Normal','High','Low','Unknown'], required: true },

  flagged: {type: Boolean, default: false},
  measuredDateTime: {type: Date, default: Date.now}
});


// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'User' collection in the MongoDB database
let PatientsModel = mongoose.model('Patients', patientsSchema);
let ClinicalDataModel = mongoose.model('ClinicalData', clinicalDataSchema);



//if reading is critical based on type and value

function isReadingCritical(type, value) {
  type = type.toLowerCase();
  
  if(type === 'blood pressure') {
    //value is expected to be in the format "systolic/diastolic" 
    let parts = value.split('/');
    if(parts.length !== 2) return false; //invalid format
    let systolic = parseInt(parts[0]);
    let diastolic = parseInt(parts[1]);
    if(isNaN(systolic) || isNaN(diastolic)) return false; //invalid numbers
    
   return (systolic >= 180 || diastolic >= 120 || systolic < 50 || diastolic < 40);
  }


  if (type === 'heart rate') {
    let hr = parseInt(value);
    if(isNaN(hr)) return false;
    return (hr < 40 || hr > 120); 
  }

  if (type === 'respiratory rate') {
    let rr = parseInt(value);
    if(isNaN(rr)) return false;
    return (rr < 12 || rr > 25); 
  }

  if (type === 'spo2') {
    let spo2 = parseFloat(value);
    if(isNaN(spo2)) return false;
    return (spo2 < 92); 
  }

  return false; 
}

let errors = require('restify-errors');
let restify = require('restify')

  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

  server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('**** Resources: ****')
  console.log('********************')
  console.log(' /patients')
  console.log(' /patients/:id')
  console.log(' /clinicaldata')
  console.log(' /clinicaldata/patients/:patientId')
  console.log('/patients/critical')
});

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

/////////////////////////////////////////////

server.post('/patients', function (req, res, next) {;

  if (!req.body) {
    return next(new errors.BadRequestError('Request body is missing or not parsed. Make sure you send JSON and set Content-Type: application/json'));
  }

  if (req.body.firstName === undefined ) {
    return next(new errors.BadRequestError('Patient first name must be supplied'))
  }else if (req.body.lastName === undefined ) {
    return next(new errors.BadRequestError('Patient last name must be supplied'))
  }else if (req.body.dob === undefined ) {
    return next(new errors.BadRequestError('Patient date of birth must be supplied'))
  }else if (req.body.gender === undefined ) {
    return next(new errors.BadRequestError('Patient gender must be supplied'))
  }else if (req.body.phone === undefined ) {
    return next(new errors.BadRequestError('Patient phone number must be supplied'))
  }else if (req.body.email === undefined ) {
    return next(new errors.BadRequestError('Patient email must be supplied'))
  }else if (req.body.address === undefined ) {
    return next(new errors.BadRequestError('Patient address must be supplied'))
  }

  
  patientscontact = req.body.contact || "Not Provided"

  let newPatients = new PatientsModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dob: req.body.dob,
    gender: req.body.gender,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address
  });

  newPatients.save()
    .then((user)=> {
      console.log("saved patients: " + user);
      res.send(201, user);
      return next();
    })
    .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
  });  
})


server.get('/patients', function (req, res, next) {
  console.log('GET /patients params=>' + JSON.stringify(req.params));

  PatientsModel.find({})
    .then((users)=>{
        res.send(users);
        return next();
    })
    .catch((error)=>{
        return next(new Error(JSON.stringify(error.errors)));
    });
})


server.get('/patients/:id', function (req, res, next) {
  console.log('GET /patients/:id params=>' + JSON.stringify(req.params));

  PatientsModel.findOne({ _id: req.params.id })
  .then((user)=>{
    console.log("found patients: " + user);
    if (user) {
      res.send(user)
    } else {
      res.send(404)
    }
    return next();
  })
  .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
  });
})



//delete patient by id
server.del('/patients/:id', function (req, res, next) {
  console.log('DELETE /patients/:id params=>' + JSON.stringify(req.params));
  PatientsModel.findOneAndDelete({ _id: req.params.id })
    .then((deletedPatient)=>{      
      console.log("deleted patient: " + deletedPatient);
      if(deletedPatient){
        res.send(200, deletedPatient);
      } else {
        res.send(404, "Patient not found");
      }   
      return next();
    })
    .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});

////////////////////////////////////////////////////////////////////

//clinical data endpoints 
server.post('/clinicaldata', function (req, res, next) {
  console.log('POST /clinicaldata params=>' + JSON.stringify(req.params));
  console.log('POST /clinicaldata body=>' + JSON.stringify(req.body));
  // validation of manadatory fields
  if (req.body.patientId === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('patientId must be supplied'))
  } else if (req.body.type === undefined ) {
    return next(new errors.BadRequestError('type must be supplied'))
  } else if (req.body.value === undefined ) {
    return next(new errors.BadRequestError('value must be supplied'))
  } 
  let isCritical = isReadingCritical(req.body.type, req.body.value);
/////////

let classification = 'Unknown';
let systolicNum = null;
let diastolicNum = null;

if (req.body.type === 'Blood Pressure' && req.body.value) {
  const parts = req.body.value.split('/');
  systolicNum = Number(parts[0]);
  diastolicNum = Number(parts[1]);

  if (systolicNum >= 140 || diastolicNum >= 90) {
    classification = 'High';
  } else if (systolicNum <= 90 || diastolicNum <= 60) {
     classification = "Low";
  } else {
    classification = 'Normal';
  }
}

else if (req.body.type === 'Heart Rate' && req.body.value) {
    const hrValue = Number(req.body.value);
    
    if (hrValue > 120) {
      classification = 'High'; 
    } else {
      classification = 'Normal';
    }
  }
////////

  let newClinicalData = new ClinicalDataModel({ 
    patientId: req.body.patientId,
    type: req.body.type,
    value: req.body.value,
    systolic: systolicNum,
    diastolic: diastolicNum,
    classification: classification,
    flagged: isCritical,
    measuredDateTime: req.body.measuredDateTime || new Date()
  });

  // Create the clinical data and save to db
  newClinicalData.save()
    .then((data)=> {  
      console.log("saved clinical data: " + data);
      // Send the clinical data if no issues
      res.send(201, data);
      return next();
    })
    .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
  }); 
})



server.get('/clinicaldata/patients/:patientId', function (req, res, next) {
  console.log(`GET /clinicaldata/patients/:patientId params=>${JSON.stringify(req.params)}`);  
  ClinicalDataModel.find({ patientId: req.params.patientId })
    .then((data)=>{
        res.send(data); 
        return next();
    })
    .catch((error)=>{
        return next(new Error(JSON.stringify(error.errors)));
    });
})

///////////////////////////////////////////////////////////////////

// Function to handle the asynchronous check for critical status
async function getCriticalPatients(PatientModel, ClinicalDataModel) {
    try {
        const allPatients = await PatientModel.find({});
        
        // Use Promise.all to efficiently check all patients concurrently
        const checks = allPatients.map(async (patient) => {
            
            // Find the ONE most recent clinical record for this patient
            const latestRecord = await ClinicalDataModel.findOne({ patientId: patient._id })
                .sort({ measuredDateTime: -1 })
                .limit(1);

            // Check if the record exists and is Critical ('High' or 'Low')
            if (latestRecord) {
                if (latestRecord.classification === 'High' || latestRecord.classification === 'Low') {
                    const criticalPatient = patient.toObject(); 
                    criticalPatient.latestRecord = latestRecord; 
                    return criticalPatient; 
                }
            }
            return null;
        });
        
        // Wait for all checks to complete and filter out the null results
        const criticalList = (await Promise.all(checks)).filter(p => p !== null);
        
        return criticalList;

    } catch (error) {
        throw error;
    }
}
// GET Endpoint for Critical Patients (Matching your callback style)
server.get('/patients/critical', function (req, res, next) { // <-- FIX IS HERE: NOT async
    console.log("GET /patients/critical");

    // Call the async helper function and handle the promise using .then/.catch
    getCriticalPatients(PatientsModel, ClinicalDataModel)
        .then((criticalPatients) => {
            // Success: Send the response
            res.send(criticalPatients);
            return next();
        })
        .catch((error) => {
            console.error("Error finding critical patients:", error);
            // Error: Pass the error to the next handler
            return next(new errors.InternalServerError("Could not fetch critical patients due to a database error."));
        });
});










