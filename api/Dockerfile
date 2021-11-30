FROM python:3.8 as python
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN curl --request GET \
    --url 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json'\
    --output './owid-covid-data.json'
EXPOSE 8000
CMD ["python", "./src/main.py"]