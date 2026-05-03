const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  let authToken = '';
  let adminToken = '';
  let bikeId = '';

  // User Routes
  describe('User API Tests', () => {
    it('Post /create | Register new user', async () => {
      const response = await request(app).post('/api/user/create').send({
        fullName: 'test test',
        email: 'test@gmail.com',
        password: '12345678',
        phoneNumber: '9844',
      });
      if (response.statusCode === 201) {
        expect(response.body.message).toEqual('User Created Successfully');
      } else {
        expect(response.body.message).toEqual('User Already Exists');
      }
    });
    it('Post /create  | Register Admin', async () => {
      const response = await request(app).post('/api/user/create').send({
        fullName: 'Admin Admin',
        email: 'admin@gmail.com',
        password: '12345678',
        phoneNumber: '9844642649',
        isAdmin: true,
      });
      if (response.statusCode === 201) {
        expect(response.body.message).toEqual('User Created Successfully');
      } else {
        expect(response.body.message).toEqual('User Already Exists');
      }
    });

    it('Post /login | Login user', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: 'test@gmail.com',
        password: '12345678',
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('Post /login | Login Admin', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: 'admin@gmail.com',
        password: 'admin123',
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      adminToken = response.body.token;
    });

    it('Get /get | Get user by id', async () => {
      const response = await request(app)
        .get(`/api/user/current_profile`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      console.log(response.body.user);
      expect(response.body.user.email).toBe('test@gmail.com');
    });
  });

  // Bike Routes
  describe('Bike Product API Tests', () => {
    it('POST /create/bike | Add new bike', async () => {
      const response = await request(app)
        .post('/api/bike/create/bike')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('bikeName', 'Test Bike')
        .field('bikeModel', 'Test Model')
        .field('bikePrice', '150000')
        .attach('bikeImage', 'path/to/test/image.png'); // Replace with actual path to a test image

      expect(response.statusCode).toBe(201);
      console.log(response.body);
      expect(response.body).toHaveProperty('message', 'Product Created');
      expect(response.body.bike).toHaveProperty('bikeName', 'Test Bike');
      bikeId = response.body.bike._id;
    });

    it('GET /get_all_bikes | Fetch all bikes', async () => {
      const response = await request(app).get('/api/bike/get_all_bikes');
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'All Bikes Fetched');
      expect(response.body.bikes.length).toBeGreaterThan(0);
    });

    it('GET /get_one_bike/:id | Fetch single bike', async () => {
      const response = await request(app)
        .get(`/api/bike/get_one_bike/${bikeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'Product Fetched');
      expect(response.body.bike).toHaveProperty('_id', bikeId);
    });

    it('PUT /update_bike/:id | Update bike', async () => {
      const response = await request(app)
        .put(`/api/bike/update_bike/${bikeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bikePrice: '200000' });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'Product Updated');
      expect(response.body.updateBike).toHaveProperty('bikePrice', '200000');
    });

    it('DELETE /delete_bike/:id | Delete bike', async () => {
      const response = await request(app)
        .delete(`/api/bike/delete_bike/${bikeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'Product Deleted');
    });

    it('GET /pagination | Paginate bikes', async () => {
      const response = await request(app).get(
        '/api/bike/pagination?page=1&limit=2'
      );
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'Product Fetched');
      // expect(response.body.bikes.length).toBeLessThanOrEqual(2);
    });

    it('GET /bike_count | Get total bike count', async () => {
      const response = await request(app).get('/api/bike/bike_count');
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'Total Bikes');
      expect(response.body).toHaveProperty('count');
    });

    it('GET /model/all | Fetch all bike models', async () => {
      const response = await request(app).get('/api/bike/model/all');
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty(
        'message',
        'Categories fetched successfully'
      );
      expect(response.body.categories.length).toBeGreaterThan(0);
    });

    it('GET /model | Fetch bikes by model', async () => {
      const response = await request(app).get(
        '/api/bike/model?bikeName=Test Bike'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Bikes Model fetched successfully'
      );
      expect(response.body.bikes.length).toBeGreaterThan(0);
    });
  });

  // // Adoption Routes
  // describe('Adoption API Tests', () => {
  //   it('Post /add | Adopt pet (successful)', async () => {
  //     const form = {
  //       fname: 'test',
  //       lname: 'test',
  //       email: 'test@gmail.com',
  //       age: 21,
  //       phone: '1234567890',
  //       gender: 'male',
  //       houseType: 'test',
  //       reason: 'test',
  //       yard: 'test',
  //       petExperience: 'test',
  //     };
  //     const response = await request(app)
  //       .post(`/api/adoption/create`)
  //       .send({
  //         pet: petId,
  //         form: form,
  //         formReceiver: adminId,
  //       })
  //       .set('Authorization', `Bearer ${authToken}`);

  //     expect(response.statusCode).toBe(201);
  //     expect(response.body).toHaveProperty('message');
  //   });

  //   it('Post /add | Adopt pet (duplicate - should fail)', async () => {
  //     const form = {
  //       fname: 'test',
  //       lname: 'test',
  //       email: 'test@gmail.com',
  //       age: 21,
  //       phone: '1234567890',
  //       gender: 'male',
  //       houseType: 'test',
  //       reason: 'test',
  //       yard: 'test',
  //       petExperience: 'test',
  //     };
  //     const response = await request(app)
  //       .post(`/api/adoption/create`)
  //       .send({
  //         pet: petId,
  //         form: form,
  //         formReceiver: adminId,
  //       })
  //       .set('Authorization', `Bearer ${authToken}`);

  //     expect(response.statusCode).toBe(400);
  //     expect(response.body).toHaveProperty('message');
  //   });

  //   it('Get /get/:petId | Get adoption by pet id', async () => {
  //     const response = await request(app)
  //       .get(`/api/adoption/get/${petId}`)
  //       .set('Authorization', `Bearer ${authToken}`);
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body).toHaveProperty('adoption');
  //     expect(response.body.count > 0).toBe(true);
  //   });
  // });

  // // Cleanup
  // describe('Cleanup', () => {
  //   it('Delete /delete | Delete pet', async () => {
  //     const response = await request(app)
  //       .delete(`/api/pet/delete/${petId}`)
  //       .set('Authorization', `Bearer ${adminToken}`);
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body).toHaveProperty('message');
  //   });

  // Commented out user deletion tests
  // it('Delete /delete | Delete adopter', async () => {
  //   const response = await request(app)
  //     .delete(`/api/user/delete`)
  //     .set('Authorization', `Bearer ${authToken}`);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body).toHaveProperty('message');
  // });
  // it('Delete /delete | Delete owner', async () => {
  //   const response = await request(app)
  //     .delete(`/api/user/delete`)
  //     .set('Authorization', `Bearer ${adminToken}`);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body).toHaveProperty('message');
  // });
  //   });
});
