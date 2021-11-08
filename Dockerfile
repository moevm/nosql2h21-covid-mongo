FROM python:3.8

WORKDIR /nosql2h21-covid-mongo

COPY * /nosql2h21-covid-mongo/

RUN pip install -r requirements.txt

CMD python ./main.py ${MONGODB_USERNAME} ${MONGODB_PASSWORD}