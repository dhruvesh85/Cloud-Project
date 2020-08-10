const express = require ('express');
const app = express();

app.use(express.json());

app.post('/sms', async (req, res) => {
  students = req.body.students
  console.log(students);

  var AWS = require('aws-sdk');
  AWS.config.update({region: 'us-east-1'});
  
  var sent = false;
  
  for (const element of students) {
    var params = {
        Message: "You are enroll in the course: "+element.courseId+". Use the student id: "+element.studentId+" to register on Dalhousie University", 
        PhoneNumber: "+1"+element.phone,
      };
    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
    await publishTextPromise.then(
    async function(data) {
      sent = true;
      console.log("MessageID is " + data.MessageId);
    }).catch(
    async function(err) {
      console.error(err, err.stack);
    }); 
  }
  
  if(sent == true){
    res.send("Message sent to students!")
  }
});

const port = process.env.PORT || 3000;
app.listen (3000, () => console.log(`Listening on port ${port}...`));