import React, { useEffect, useState } from "react";
import { View, Text, Image, Button } from "react-native";
import { Camera } from "expo-camera";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (product) {
      setLoading(false);
    }
  }, [product]);

  const handleBarCodeScanned = async (barcode) => {
    setLoading(true);
    const { data } = barcode;

    const res = await fetch(
      `https://se.openfoodfacts.org/api/v0/product/${data}.json`
    );

    const productData = await res.json();

    setProduct(productData.product ? productData.product : { notFound: true });
  };

  if (!hasPermission) {
    return (
      <View>
        <Text>Waiting...</Text>
      </View>
    );
  }

  if (loading) {
    <Loading />;
  }

  if (product) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24 }}>
          {product.notFound ? "Hittade ingen info." : product.product_name}
        </Text>
        <Button onPress={() => setProduct(null)} title="Scanna ny produkt" />
        {product.image_front_url && (
          <Image
            source={{ uri: product.image_front_url }}
            style={{
              height: product.images["1"]["sizes"]["400"]["h"],
              width: product.images["1"]["sizes"]["400"]["w"],
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={handleBarCodeScanned}
      ></Camera>
    </View>
  );
}

function Loading() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 24 }}>Hämtar info om produkten...</Text>
    </View>
  );
}
