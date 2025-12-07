const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

// Point this to your running backend
const uri = 'http://127.0.0.1:3000'; 

describe('MedRecord API Integration Tests', function() {

    this.timeout(15000);
    
    let testPatientId;

   // 1. CREATE A PATIENT
    it("should CREATE a new patient", function(done) {
        chai.request(uri)
            .post('/patients')
            .send({
                firstName: 'Chai',
                lastName: 'TestUser',
                dob: '01/01/1980',
                gender: 'Male',
                phone: '416-555-0199',
                email: 'chai.test@example.com',
                address: '123 Node Street'
            })
            .end(function(err, res) {
                expect(res.status).to.equal(201);
                expect(res.body).to.have.property('_id');
                expect(res.body).to.have.property('firstName', 'Chai');
                
                // Save the ID for the next tests
                testPatientId = res.body._id; 
                done();
            });
    });

    // 2. GET PATIENTS
    it("should GET all patients", function(done) {
        chai.request(uri)
            .get('/patients')
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    // 3. POST CLINICAL DATA (NORMAL)
    it("should add NORMAL clinical data (Heart Rate: 75)", function(done) {
        chai.request(uri)
            .post('/clinicaldata')
            .send({
                patientId: testPatientId, // using the ID from Test #1
                type: 'Heart Rate',
                value: '75'
            })
            .end(function(err, res) {
                expect(res.status).to.equal(201);
                expect(res.body).to.have.property('classification', 'Normal');
                done();
            });
    });

    // 4. POST CLINICAL DATA (CRITICAL)
    it("should add CRITICAL clinical data (BP: 180/120)", function(done) {
        chai.request(uri)
            .post('/clinicaldata')
            .send({
                patientId: testPatientId,
                type: 'Blood Pressure',
                value: '180/120'
            })
            .end(function(err, res) {
                expect(res.status).to.equal(201);
                expect(res.body).to.have.property('classification', 'High');
                expect(res.body).to.have.property('flagged', true);
                done();
            });
    });

    // 5. GET CLINICAL DATA FOR PATIENT
    it("should GET clinical data for the specific patient", function(done) {
        chai.request(uri)
            .get('/clinicaldata/patients/' + testPatientId) 
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('array');
                // We added 2 records, so length should be at least 2
                expect(res.body.length).to.be.greaterThanOrEqual(2);
                done();
            });
    });

    // 6. GET CRITICAL PATIENTS
    it("should find the patient in the CRITICAL list", function(done) {
        chai.request(uri)
            .get('/patients/critical') 
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('array');
                
                // Since we gave this patient high BP, they should be in this list
                const found = res.body.find(p => p._id === testPatientId);
                expect(found).to.not.be.undefined; 
                done();
            });
    });

    // 7. DELETE PATIENT
    it("should DELETE the test patient", function(done) {
        chai.request(uri)
            .delete('/patients/' + testPatientId)
            .end(function(err, res) {
                // Your index.js sends 200 (OK) on delete
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property('_id', testPatientId);
                done();
            });
    });
});