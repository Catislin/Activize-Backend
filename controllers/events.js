const bodyParser = require('body-parser');
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const mapIcons = require('../models/MapIcons');

module.exports = function(app) {

  /**** GET all events ****/
  app.get('/events', (req, res, next) => {
    Event.find(function(err, events) {
      if (err) {
        console.log(err)
        res.status(500).send({message: "Could not get all events"})
      }
      res.send(events);
    })
  });

  app.get('/hap/:id/dashboard', (req, res) => {
    const mapApiKey = 'AIzaSyCucitjj7AcVk8Hv35Pd6JVPQiNhzB8LwI';
    Event.findById(req.params.id, (err, hap) => {
      User.find({'_id': { $in: hap.attendees}}, (err, users) => {
        if(req.user){
          User.findById(req.user.id, (err, user) => {
            res.render('dashboard', {
              mapApiKey : mapApiKey,
              user : user,
              hap : hap,
              people : users,
              mapIcons : mapIcons
            });
          })
        }else{
          res.render('dashboard', {
            mapApiKey : mapApiKey,
            hap : hap,
            people : users,
            mapIcons : mapIcons
          });
        }
      })
    })
  });

  function getDistanceToHap(pos1,pos2) {
    function deg2rad(deg){
      return deg * (Math.PI / 180);
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(pos2.lat-pos1.lat);  // deg2rad below
    var dlng = deg2rad(pos2.lng-pos1.lng);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(pos1.lat)) * Math.cos(deg2rad(pos2.lat)) *
      Math.sin(dlng/2) * Math.sin(dlng/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    d = d * 0.621371;
    return Math.round(d * 10) / 10;
  }

  /**** GET Nearby Haps ****/
  app.post('/near_haps', (req, res) => {
    const maxDistance = 0.3;
    let userLoc = req.body.userLoc;
    Event.find({loc: {$near:userLoc, $maxDistance: maxDistance} }, function(err, haps){
      if(haps){
        let userPos = {lat : userLoc[1], lng : userLoc[0]};
        let hapDistances = {};
        haps.forEach((hap) => {
          let hapPos = {lat : hap.lat, lng : hap.lng};
          hapDistances[hap._id] = getDistanceToHap(userPos, hapPos);
        })
        res.send({haps, hapDistances});
      }
    });
  })

  /**** GET an event by ID ****/
  app.get('/events/:eventId', (req, res, next) => {
    Event.findById(req.params.eventId).exec(function(err, event) {
      if (err) {
        return res.status(500).send("Could not get this event");
      }
      // console.log(event);
      return res.status(200).send(event);
    })
  })

  /**** GET the list of events that a user has created and is attending ****/
  app.get('/users/:userId/events', (req, res) => {
    // Look up the user by id and populate the array of events they've created
    User.findById(req.params.userId).populate('events').populate('attending').exec(function(err, user) {
      if (err) {
        console.log("Error: " + err);
        return res.status(401).send({message: "Could not find user", err});
      }
      console.log("User events: ", user.events)
      console.log("User attending: ", user.attending)
      return res.status(200).send({ created: user.events, attending: user.attending })
    })
  })

  /**** CREATE a new event ****/
  app.post('/events/new', (req, res) => {
    // first look up the user with the id passed in the body
    User.findById(req.body.userId).exec(function(err, user) {
      if (err) {
        console.log("Error: " + err)
        return res.status(401).send({message: "Could not find user"});
      }
      if (!user) {
        return res.status(401).send({message: "Could not find user"});
      }

      // Create an Event object from the data in the request body
      const event = new Event({
        name: req.body.name,
        address: req.body.address,
        placeId: req.body.placeId,
        lat: req.body.lat,
        lng: req.body.lng,
        loc: [req.body.lng, req.body.lat],
        date: req.body.date,
        description: req.body.description,
        organizer: user.username,
        organizerId: req.body.userId,
        tags: req.body.tags
      })

      // Then save the event to the database
      event.save(function(err, createdEvent) {
        if (err) {
          console.log("Could not save event!")
          console.log(err)
          return res.status(500).send({message: "Could not save event", err})
        }
        console.log("Saved new event!")

        // Save the ID of the created event to the user who created it
        user.events.push(createdEvent._id);
        user.save(); // TODO next lines should be in a promise (?)
        user.markModified('events');
        return res.status(200).send(event);
      })
    })
  })

}
