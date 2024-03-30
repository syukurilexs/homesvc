cd ../
docker build --pull --rm -f "Dockerfile" -t syukurilexshomesvc:latest "." 
docker tag syukurilexshomesvc:latest syukurilexs/homesvc:latest
docker push syukurilexs/homesvc:latest

# Change this version before run
version=1.2.1
docker build --pull --rm -f "Dockerfile" -t syukurilexshomesvc:$version "." 
docker tag syukurilexshomesvc:latest syukurilexs/homesvc:$version
docker push syukurilexs/homesvc:$version