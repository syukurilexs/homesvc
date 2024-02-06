cd ../
docker build --pull --rm -f "Dockerfile" -t syukurilexshomesvc:latest "." 
docker tag syukurilexshomesvc:latest syukurilexs/homesvc:latest
docker push syukurilexs/homesvc:latest