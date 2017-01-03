PHOENIX
=============

>  A collective tool of reusable libraries!

### Libraries
- Annotate
- EventBus
- Logger
- Modal
- Panel
- Request Handler
- Select Box
- Table Character Alignment
- Helper
- Menu item abstract

#### Build

Build Docker
------------
sudo docker build -t ui-build docker

***Default***

```sh
$ sh build.sh
```

**Custom Dist Folder - When calling from other folders**
# sh phoenix/build.sh "output folder" "phoenix basepath"
```sh
$ sh build.sh "dist/phoenix" "phoenix"
```
