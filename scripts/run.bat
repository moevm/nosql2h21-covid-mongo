@echo off

set /A build=0

FOR %%A in (%*) DO (
    IF "%%A"=="--build" ( set /A build=1 )
    IF "%%A"=="-b" ( set /A build=1 )
)

IF %build%==1 (
    @echo on
    docker-compose -f %~dp0..\docker-compose.yml up -d --build
) ELSE (
    @echo on
    docker-compose -f %~dp0..\docker-compose.yml up -d
)

docker image prune -f
docker volume prune -f