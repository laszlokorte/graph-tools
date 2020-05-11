const softClamp = (val, newVal, min, max) => {
    if(newVal > max && val > max) {
        return Math.min(newVal, val);
    } else if(newVal < min && val < min) {
        return Math.max(newVal, val);
    } else {
        return Math.min(Math.max(min, newVal), max);
    }
}

const initilState = {
        center: {x: 0, y:0},
        rotation: 0,
        zoom: 1,
        bounds: {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
            defaultZoom: 1,
            minZoom: 1,
            maxZoom: 1,
        },
        panX: null,
        panY: null,
    }

export default function cameraReducer(camera = initilState, action)  {
    const bounds = camera.bounds;

    switch(action.type) {
        case 'CAMERA_CLAMP':
            return {
                ...camera,
                bounds: {
                    minX: action.box.minX,
                    maxX: action.box.maxX,
                    minY: action.box.minY,
                    maxY: action.box.maxY,
                    defaultZoom: Math.min(
                      action.screen.width/(action.box.maxX - action.box.minX),
                      action.screen.height/(action.box.maxY - action.box.minY),
                      20
                    ),
                    minZoom: Math.min(
                      action.screen.width / (action.box.maxX - action.box.minX),
                      action.screen.height / (action.box.maxY - action.box.minY),
                      0.8
                    ),
                    maxZoom: 6,
                },
            };
        case 'CAMERA_ZOOM':
            const newZoom = softClamp(camera.zoom, camera.zoom * action.factor, bounds.minZoom, bounds.maxZoom)
            const realFactor = newZoom / camera.zoom;
            const panFactor = 1 - 1 / realFactor;

            const newX = softClamp(camera.center.x, camera.center.x + (action.x - camera.center.x) * panFactor, bounds.minX, bounds.maxX)
            const newY = softClamp(camera.center.y, camera.center.y + (action.y - camera.center.y) * panFactor, bounds.minY, bounds.maxY)

            return {
              ...camera,
              zoom: newZoom,
              center: {
                  ...camera.center,
                  x: newX,
                  y: newY,
              },
            };
        case 'CAMERA_JUMP_ZOOM': {
            if(camera.rotation != 0) {
                return cameraReducer(camera, {type: 'CAMERA_RESET'})
            } else if(Math.abs(camera.zoom / camera.bounds.defaultZoom) < 1.05) {
                return cameraReducer(camera, {type:'CAMERA_ZOOM', x: action.x, y: action.y, factor: camera.bounds.maxZoom / 2})
            } else {
                return cameraReducer(camera, {type: 'CAMERA_RESET'})
                //cameraReducer(camera, {typ:'zoom', pivot:action,factor:bounds.defaultZoom / camera.zoom})
            }
        }
        case 'CAMERA_ROTATE':
            const deltaAngle = action.deltaAngle;
            const dx = camera.center.x - action.x;
            const dy = camera.center.y - action.y;
            const rad = Math.PI * deltaAngle / 180;
            const sin = Math.sin(-rad)
            const cos = Math.cos(-rad)

            return {
              ...camera,
              center: {
                  ...camera.center,
                  x: action.x + cos * dx - sin * dy, //softClamp(camera.center.x, , bounds.minX, bounds.maxX),
                  y: action.y + sin * dx + cos * dy, //softClamp(camera.center.y, , bounds.minY, bounds.maxY),
              },
              rotation: (camera.rotation + deltaAngle) % 360,
            };
        case 'CAMERA_PAN': {
            const sin = Math.sin(camera.rotation * Math.PI / 180)
            const cos = Math.cos(camera.rotation * Math.PI / 180)
            const dx = (cos * action.deltaX + sin * action.deltaY)  / camera.zoom
            const dy = (-sin * action.deltaX + cos * action.deltaY) / camera.zoom
            return {
              ...camera,
                center: {
                    ...camera.center,
                    x: softClamp(camera.center.x, camera.center.x + dx, bounds.minX, bounds.maxX),
                    y: softClamp(camera.center.y, camera.center.y + dy, bounds.minY, bounds.maxY),
                },
            }
        }
        case 'CAMERA_RESET':
            return {
                ...camera,
                center: {
                    ...camera.center,
                    x: (bounds.minX + bounds.maxX) / 2,
                    y: (bounds.minY + bounds.maxY) / 2,
                },
                rotation: 0,
                zoom: bounds.defaultZoom,
            }
        case 'CAMERA_START_PAN':
            return {
                ...camera,
                panX: action.x,
                panY: action.y,
            }
        case 'CAMERA_STOP_PAN':
            return {
                ...camera,
                panX: null,
                panY: null,
            }
        case 'CAMERA_MOVE_PAN':
            if(camera.panX === null || camera.panY === null) {
                return camera;
            }
            const deltaX = action.x - camera.panX;
            const deltaY = action.y - camera.panY;
            return {
              ...camera,
                center: {
                    ...camera.center,
                    x: softClamp(camera.center.x, camera.center.x - deltaX, bounds.minX, bounds.maxX),
                    y: softClamp(camera.center.y, camera.center.y - deltaY, bounds.minY, bounds.maxY),
                },
            }

    }
    return camera;
}
