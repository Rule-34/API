# Rule-34-PWA-Original-API

### App.use
app.use es para montar instrucciones a una url

Por ejemplo:
```javascript
app.use('/api', routes);
```
Bindea todas las rutas dentro de routes a /api

### Router.use
Router.use es para mapear instrucciones a una url, similar a app.use

Por ejemplo:
```javascript
router.use('/users', userRoutes);
```
Bindea todas las rutas dentro de userRoutes a /users

### Router.route
Router.route es para mapear url locales, no globales


Por ejemplo:
```javascript
router.route('/')
  /** GET /api/users - Get list of users */
  .get(userCtrl.list)
```
Bindea la ruta / a /api/users