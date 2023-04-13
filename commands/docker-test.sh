docker build -t romaklimenko.azurecr.io/dirty-toolset:latest .
docker container run --name dirty-toolset -it --rm romaklimenko.azurecr.io/dirty-toolset:latest