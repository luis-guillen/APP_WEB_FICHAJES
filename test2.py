import requests

res = requests.get("http://localhost/api/users/")
users = res.json()
print("TYPE=", type(users), "VAL=", users)
manolo = [u for u in users if u["employee_code"] == "manolosal"][0]
print("Before:", manolo["assigned_projects"])

if manolo["assigned_projects"]:
    pid = manolo["assigned_projects"][0]["project_id"]
    res2 = requests.put(f"http://localhost/api/users/{manolo['id']}", json={"role": "PROYECTISTAS MECANICOS", "assigned_projects": [{"project_id": pid, "role": "PROGRAMADORES"}]})
    print("PUT Status:", res2.status_code)
    print("PUT Response:", res2.json().get("assigned_projects"))

res3 = requests.get(f"http://localhost/api/users/")
manolo3 = [u for u in res3.json() if u["employee_code"] == "manolosal"][0]
print("After GET:", manolo3["assigned_projects"])
