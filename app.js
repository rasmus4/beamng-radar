angular.module('beamng.apps')
.directive('radar', ['CanvasShortcuts', 'StreamsManager', 'bngApi', function (CanvasShortcuts, StreamsManager, bngApi) {
  return {
    template: '<canvas width="180"></canvas>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var streamsList = ['wheelInfo'];
      var carIds = [];
      var positions = {};
      var rotations = {};
      var ownPosition = null;
      var ownRotation = null;
      var ownCarId = -1;
      var rectWidth = 10;
      var rectHeight = 20;
      var scaleFactor = 6;
      var notSetUp = true;

      var c = element[0]
        , ctx = c.getContext('2d')
      ;

      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#00ff00';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillRect((c.width/2) - (rectHeight/2), (c.height/2) - (rectWidth/2), rectWidth, rectHeight);
      ctx.font = '11pt "Lucida Console", Monaco, monospace';

      StreamsManager.add(streamsList);
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList);
      });

      scope.forceCarSelfReport = function() {
        bngApi.engineLua("be:queueAllObjectLua(\"guihooks.trigger('_radarHookCarID', obj:getID())\")");
        bngApi.engineLua("be:getPlayerVehicleID(0)", (id) => {
          console.log("getPlayerVehicleID(0): " + id);
          ownCarId = id;
        });
      }

      scope.updateRadar = function () {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#00ff00';
        let selfAng = Math.atan2(ownRotation.y, ownRotation.x) + Math.PI/2;
        //ctx.fillText("selfAng: " + selfAng.toFixed(2), 30, 30);
        //ctx.rotate(selfAng);
        ctx.fillRect((c.width/2) - (rectHeight/2), (c.height/2) - (rectWidth/2), rectWidth, rectHeight);
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        for (let key in positions) {
          let cos = Math.cos(-selfAng);
          let sin = Math.sin(-selfAng);
          let deltaRotX = cos * (positions[key].x - ownPosition.x) - sin * (positions[key].y - ownPosition.y);
          let deltaRotY = sin * (positions[key].x - ownPosition.x) + cos * (positions[key].y - ownPosition.y);
          if (Math.abs(deltaRotX*scaleFactor) < c.width/2 && Math.abs(deltaRotY*scaleFactor) < c.height/2) {
            let ang = Math.atan2(ownRotation.y, ownRotation.x) - Math.atan2(rotations[key].y, rotations[key].x);
            let offsetX = - Math.sin(ang) * (rectHeight/2);
            let offsetY = Math.cos(ang) * (rectHeight/2);
            ctx.fillStyle = '#000000';
            //ctx.fillText("x: " + deltaRotX.toFixed(2) + "; y: " + deltaRotY.toFixed(2), 30, 30);
            ctx.moveTo(
              (c.width/2) - deltaRotX*scaleFactor + offsetX - 5, // -5 to compensate for offset caused by stroke (?)
              (c.height/2) + deltaRotY*scaleFactor + offsetY
            );
            ctx.lineTo(
              (c.width/2) - deltaRotX*scaleFactor - offsetX - 5, // -5 to compensate for offset caused by stroke (?)
              (c.height/2) + deltaRotY*scaleFactor - offsetY
            );
            ctx.lineWidth = rectWidth;
            ctx.stroke();
          } else {
          }
        }
      };

      scope.$on("VehicleChange", function() {
        scope.forceCarSelfReport();
        console.log("on VehicleChange")
      });

      scope.$on("_radarHookCarID", function(event, id) {
        console.log("_radarHookCarID");
        if (carIds.includes(id)) return;
        carIds.push(id);
        console.log("pushed id '" + id + "'");
      });

      scope.$on("streamsUpdate", function(_, _) {
        if (notSetUp) {
          scope.forceCarSelfReport();
          notSetUp = false;
        }
        if (carIds.length > 0) {
          let self = this;
          if (ownCarId == -1) return;
          for (var i = 0; i < carIds.length; i++) {
            let id = carIds[i];
            bngApi.engineLua('{pos=vec3(be:getObjectByID(' + id + '):getPosition()), rot=vec3(be:getObjectByID(' + id + '):getDirectionVector())}', (response) => {
              if (id == ownCarId) {
                ownPosition = response.pos;
                ownRotation = response.rot;
              } else {
                positions[id] = response.pos;
                rotations[id] = response.rot;
              }
              /*console.log(response.pos.x + ", " + response.pos.y + ", " + response.pos.z + "; " +
                response.rot.x + ", " + response.rot.y + ", " + response.rot.z
              );*/
              if (id == carIds[carIds.length - 1]) {
                scope.updateRadar();
              }
            });
          }
        }
      });
    }
  };
}]);
