async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  
  const url = form.action;
  try {
    const formData = new FormData(form);

    await postFormDataJson({url, formData});

    window.location.href = '/';

  } catch (error) {
    alert(error.message);
  }
}

async function postFormDataJson({url, formData}) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJson = JSON.stringify(plainFormData);
  
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
	},
    body: formDataJson
  };
  
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
}

