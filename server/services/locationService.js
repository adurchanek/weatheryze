const fetchLocation = async (req) => {
  const dummyLocations = [
    {
      latitude: -22.3142,
      longitude: 53.7396,
      name: "Newark",
      id: "1",
      country: "United States",
      zip: "00000",
    },
    {
      latitude: 42.8142,
      longitude: -73.9396,
      name: "New York",
      id: "2",
      country: "United States",
      zip: "111111",
    },
    {
      latitude: 12.8142,
      longitude: -3.9396,
      name: "New Orleans",
      id: "3",
      country: "United States",
      zip: "222222",
    },
  ];

  return dummyLocations;
};

export default fetchLocation;
