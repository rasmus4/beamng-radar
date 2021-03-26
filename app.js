angular.module('beamng.apps')
.directive('radar', ['CanvasShortcuts', 'StreamsManager', 'bngApi', function (CanvasShortcuts, StreamsManager, bngApi) {
  return {
    template: '<canvas width="180" height="180"></canvas>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var streamsList = ['sensors'];
      var carIds = [];
      var carList = [];
      var positions = {};
      var objectCount = 0
      var rotations = {};
      var dimensions = {};
      var ownPosition = null;
      var ownRotation = null;
      var ownDimension = null;
      var ownCarId = -1;
      var notSetUp = true;
      var removeOldIds = false;

      var c = element[0];
      var ctx = c.getContext('2d');

      var rectWidth = c.width/18;
      var rectHeight = c.width/9;
      var scaleFactor = rectWidth * 0.6;

      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#00ff00';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillRect((c.width/2) - (rectHeight/2), (c.height/2) - (rectWidth/2), rectWidth, rectHeight);
      ctx.font = '11pt "Lucida Console", Monaco, monospace';

      StreamsManager.add(streamsList);
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList);
      });
    

      scope.updateRadar = function (count) {
        if (count == 0 || notSetUp) return;
        ctx.clearRect(0, 0, c.width, c.height);
        let selfAng = Math.atan2(ownRotation.y, ownRotation.x) + Math.PI/2;
        ctx.beginPath();
        for (var key = 0; key < count; key++) {
          if( !positions[key]) continue;
          ctx.strokeStyle = 'white';
          //rectWidth = dimensions[key].w * scaleFactor
          //rectHeight = dimensions[key].l * scaleFactor
          let cos = Math.cos(-selfAng);
          let sin = Math.sin(-selfAng);
          let deltaRotX = cos * (positions[key].x - ownPosition.x) - sin * (positions[key].y - ownPosition.y);
          let deltaRotY = sin * (positions[key].x - ownPosition.x) + cos * (positions[key].y - ownPosition.y);
          if (Math.abs(deltaRotX*scaleFactor) < c.width && Math.abs(deltaRotY*scaleFactor) < c.height) {
            let ang = Math.atan2(ownRotation.y, ownRotation.x) - Math.atan2(rotations[key].y, rotations[key].x);
            let offsetX = - Math.sin(ang) * (rectHeight/2); 
            let offsetY = Math.cos(ang) * (rectHeight/2) ; 
            
    
            ctx.strokeStyle = 'white'
            ctx.moveTo(
              (c.width/2) - deltaRotX*scaleFactor + offsetX,
              (c.height/2) + deltaRotY*scaleFactor + offsetY
            );
            ctx.lineTo(
              (c.width/2) - deltaRotX*scaleFactor - offsetX,
              (c.height/2) + deltaRotY*scaleFactor - offsetY
            );
            
            ctx.lineWidth = rectWidth;
            
        
          } 
        }
        ctx.stroke();
         ctx.beginPath();
        ctx.strokeStyle = '#00ff00';
        //rectWidth = ownDimension.w  * scaleFactor
        //rectHeight = ownDimension.l * scaleFactor
        
        ctx.moveTo(
              (c.width/2) ,
              (c.height/2)- rectHeight/2
            );
        ctx.lineTo(
          (c.width/2) ,
          (c.height/2) + rectHeight/2
        );
        ctx.lineWidth = rectWidth ;
        ctx.stroke();
            
      };
      var readVehicleData = function(event, data) {
        bngApi.activeObjectLua("{pos=vec3(obj:getPosition()), rot=vec3(obj:getDirectionVector()),"
            +'l=obj:getInitialLength(), w=obj:getInitialWidth()}', (response) => {
            ownPosition = response.pos;
            ownRotation = response.rot;
            ownDimension = {l: response.l, w: response.w}
        });
          bngApi.engineLua("be:getObjectCount()", (count) => {
              objectCount = count;
                for (let i = 0; i < objectCount; i++) {
      //   
            bngApi.engineLua('{pos=vec3(be:getObject(' + i + '):getPosition()), rot=vec3(be:getObject(' + i + '):getDirectionVector()),'
            +'l=be:getObject(' + i + '):getInitialLength(), w=be:getObject(' + i + '):getInitialWidth()}', function(idx) { return function(response)  {
              if (response && !response.hasOwnProperty("error")) {
                  positions[idx] = response.pos;
                  rotations[idx] = response.rot;
                  dimensions[idx] = {l: response.l, w: response.w}
              } 
             }}(i));
            }
          
          })
          notSetUp = false;
      }
      
        scope.$on("VehicleFocusChanged", readVehicleData);
        scope.$on("VehicleReset", readVehicleData);
        scope.$on("VehicleconfigSaved", readVehicleData);
        scope.$on("VehicleconfigChange", readVehicleData);
        scope.$on("VehicleChangeColor", readVehicleData);
        scope.$on("VehicleChange", readVehicleData);
        scope.$on("streamsUpdate", function(event, data) {

   
          
       bngApi.activeObjectLua("{pos=vec3(obj:getPosition()), rot=vec3(obj:getDirectionVector())}", (response) => {
            ownPosition = response.pos;
            ownRotation = response.rot;
            
        });
          

              for (let i = 0; i < objectCount; i++) {
      //  l=be:getObject(' + i + '):getInitialLength(), w=be:getObject(' + i + '):getInitialWidth() 
            bngApi.engineLua('{pos=vec3(be:getObject(' + i + '):getPosition()), rot=vec3(be:getObject(' + i + '):getDirectionVector())}', function(idx) { return function(response)  {
              if (response && !response.hasOwnProperty("error")) {
                  positions[idx] = response.pos;
                  rotations[idx] = response.rot;
              } 
             }}(i));
          }
    
        scope.updateRadar(objectCount);
       
        
      });

      scope.$on('app:resized', function (event, data) {
        c.width = data.width;
        c.height = data.height;
        rectWidth = c.width/18;
        rectHeight = c.width/9;
        scaleFactor = rectWidth * 0.6;
      });
	  readVehicleData();
	}
  };
}]);
