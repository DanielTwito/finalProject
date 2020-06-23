const supertest = require('supertest');
const app = require('../reportsServer');
var TOKEN;

describe("Testing the reports API", () => {

    beforeEach(() => {
        jest.setTimeout(10000);
      });

    it("tests the base route and returns true for status", async () => {

		const response = await supertest(app).get('/');

		expect(response.status).toBe(200);
		expect(response.text).toBe("Hello sweetheart!");

    });
    

    it("tests register new user", async () => {
        const response = await supertest(app).post('/register').send({  
            userName:"test23" + Date.now(),
            password:"d123456",
            firstName:"test",
            lastName:"test",
            city:"test",
            neighborhood:"testtest",
            street:"testtesttest",
            email:"ttt@gmail.com"
         });;

		expect(response.status).toBe(200);
		expect(response.text).toBe("User registered successfully");
    });

    it("tests register an exsiting user", async () => {
        const response = await supertest(app).post('/register').send({  
            userName:"test",
            password:"d123456",
            firstName:"test",
            lastName:"test",
            city:"test",
            neighborhood:"testtest",
            street:"testtesttest",
            email:"ttt@gmail.com"
         });;

		expect(response.status).toBe(500);
		expect(response.text).toBe("{\"response\":\"User already exists\"}");
    });

    it("tests login with an exsiting user", async () => {
        const response = await supertest(app).post('/login').send({  
            userName:"test",
            password:"d123456",
         });

		expect(response.status).toBe(200);
        TOKEN = response.text;
        // console.log("--------------------------TOKEN:" + TOKEN);
    });

    it("tests login with a guest user", async () => {
        const response = await supertest(app).post('/login').send({  
            userName:"ghost",
            password:"d123456",
         });

		expect(response.status).toBe(401);
		expect(response.text).toBe("Incorrect userName or password");
    });


    it("tests add new report without authorization", async () => {
        const response = await supertest(app).post('/addReport').send({  
                date: "1588841396",
                longitude: "1",
                latitude: "2"
         });

		expect(response.status).toBe(401);
		expect(response.text).toBe("Access denied. No token provided.");
    });

    it("tests add new report with authorization", async () => {
        console.log("--------------------------TOKEN:" + TOKEN);
        const response = await supertest(app).post('/addReport').set("authrization", TOKEN).send({  
                date: "1588841396",
                longitude: "1",
                latitude: "2"
         }).set("authrization", TOKEN);

		expect(response.status).toBe(200);
		expect(response.text).toBe("Access denied. No token provided.");
    });

    it("tests getUserReports with authorization", async () => {
        console.log("--------------------------TOKEN:" + TOKEN);
        const response = await supertest(app).post('/getUserReports').set("authrization", TOKEN).set("authrization", TOKEN);

		expect(response.status).toBe(200);
    });

    it("tests getUserReports without authorization", async () => {
        console.log("--------------------------TOKEN:" + TOKEN);
        const response = await supertest(app).post('/getUserReports').set("authrization", "invalid token").set("authrization", TOKEN);

		expect(response.status).toBe(401);
		expect(response.text).toBe("Access denied. No token provided.");
    });

    it("tests getReportImage - valid URI", async () => {
        const response = await supertest(app).get('/getReportImage/?imagePath=tmp.jpeg');

		expect(response.status).toBe(200);
    });

    it("tests getReportImage - invalid URI", async () => {
        const response = await supertest(app).get('/getReportImage/?imagePath=ghost.jpg');

		expect(response.status).toBe(404);
    });

  });

