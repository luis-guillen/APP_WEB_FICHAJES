def test_get_tasks(user_client, seed_tasks):
    response = user_client.get("/tasks/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    
    # Check that the seed task 4XX has requires_extra_fields
    task_4xx = next((t for t in data if t["code"] == "400"), None)
    assert task_4xx is not None
    assert task_4xx["requires_extra_fields"] is True
    
    # Check that seed task 111 doesn't require extra fields
    task_111 = next((t for t in data if t["code"] == "111"), None)
    assert task_111 is not None
    assert task_111["requires_extra_fields"] is False
