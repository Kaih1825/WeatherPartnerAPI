import uuid
from flask import Flask, jsonify, request,render_template
import sqlite3
import time
import os

app = Flask(__name__)
database = "weather.db"
connection = sqlite3.connect(database, check_same_thread=False)
cursor = connection.cursor()
create_table_sql = """
CREATE TABLE IF NOT EXISTS weather_data (
    uuid VARCHAR(255) PRIMARY KEY,
    time VARCHAR(255) ,
    location VARCHAR(255) NOT NULL,
    temp VARCHAR(255) NOT NULL,
    wet VARCHAR(255) NOT NULL,
    purple VARCHAR(255) NOT NULL,
    water VARCHAR(255) NOT NULL
);
"""
cursor.execute(create_table_sql)

#index
@app.route('/')
def info():
    # return "Weather Partner API Server"
    return render_template("index.html")

#Post data
@app.post("/data")
def postInfo():
    try:
        data = request.get_json()
        user_location = data.get("location")
        user_temp = data.get("temp")
        user_wet = data.get("wet")
        user_purple = data.get("purple")
        user_water = data.get("water")

        if data:
            U = uuid.uuid1()
            localtime = time.localtime()
            result = time.strftime("%Y-%m-%d %I:%M:%S %p", localtime)
            insert_data_sql = """
            INSERT INTO weather_data (uuid , time, location, temp, wet, purple, water)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(insert_data_sql, (str(U), result, user_location, user_temp, user_wet, user_purple, user_water))
            connection.commit()
            return jsonify({'message': 'User success', 'uuid': str(U)})
        else:
            return jsonify({'error': ' 你最好她媽看好你的資料低能兒'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Update data
@app.put("/data/<string:uuid>")
def update(uuid):
    try:
        data = request.get_json()
        user_temp = data.get("temp")
        user_wet = data.get("wet")
        user_purple = data.get("purple")
        user_water = data.get("water")
        
        if data:
            localtime = time.localtime()
            update_data_sql = """
            UPDATE weather_data SET temp = ?, wet = ?, purple = ?, water = ?, time=? WHERE uuid = ?
            """
            cursor.execute(update_data_sql, (user_temp, user_wet, user_purple, user_water,time.strftime("%Y-%m-%d %I:%M:%S %p", localtime), uuid))
            connection.commit()
            return jsonify({'message': 'User success', 'uuid': str(uuid)})
        else:
            return jsonify({'error': ' 你最好她媽看好你的資料低能兒'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


#Get all data
@app.get("/data")
def getall():
    try:
        select_locations_sql = "SELECT * FROM weather_data"
        cursor.execute(select_locations_sql)
        results = cursor.fetchall()

        data = []
        for row in results:
            item = {
                'uuid': row[0],
                'location': row[2],
            }
            data.append(item)

        return jsonify({'data': data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Get data by location
@app.get("/data/<string:uuid>")
def get_uuid_data(uuid):
    try:
        select_uuid_data_sql = "SELECT * FROM weather_data WHERE uuid = ?"
        cursor.execute(select_uuid_data_sql, (uuid,))
        results = cursor.fetchall()

        data = []
        for row in results:
            item = {
                'uuid': row[0],
                'time': row[1],
                'location': row[2],
                'temp': row[3],
                'wet': row[4],
                'purple': row[5],
                'water': row[6]
            }
            data.append(item)

        return jsonify({'data': data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Delete data by location
@app.delete("/data/<string:uuid>")
def delete_uuid_data(uuid):
    try:
        delete_uuid_data_sql = "DELETE FROM weather_data WHERE uuid = ?"
        cursor.execute(delete_uuid_data_sql, (uuid,))
        connection.commit()

        return jsonify({'message': f'Data with UUID "{uuid}" deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == "__main__":
    from waitress import serve
    print("Server is running...")
    serve(app, host="0.0.0.0", port=8888)

cursor.close()
connection.close()
