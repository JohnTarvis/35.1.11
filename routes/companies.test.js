const request = require("supertest");
const app = require("../app");
const { createData } = require("../_test-common");
const db = require("../db");

beforeEach(createData);

describe("GET /", function () {

  test("list all", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        {code: "apple", name: "Apple"},
        {code: "ibm", name: "IBM"},
      ]
    });
  })

});

describe('404',function(){

  test('should return 404',async function(){
    const response = await request(get).get('/companies/DOESNTEXIST');
    expect(response.status).toEqual(404);
  })


});

afterAll(async () => {
  await db.end()
})


