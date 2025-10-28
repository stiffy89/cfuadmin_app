import axios from "axios";

import React, { useEffect, useState } from "react";
import { View, ScrollView, Easing, Dimensions, TouchableOpacity } from "react-native";
import { useTheme, Button, List, Divider } from "react-native-paper";
import {WebView} from "react-native-webview"
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";
import { useDataContext } from "../../helper/DataContext";
import GlobalStyles from "../../style/GlobalStyles";
import Grid from "../../helper/GridLayout";

import { createStackNavigator, StackScreenProps} from "@react-navigation/stack";
import { ResourceStackParamList} from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";
import { dataHandlerModule } from "../../helper/DataHandlerModule";
import { DummyData } from "../../data/DummyData";

import { screenFlowModule } from "../../helper/ScreenFlowModule";

import { authModule } from "../../helper/AuthModule";
import { OktaLoginResult } from "../../types/AppTypes";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";

import Pdf from "react-native-pdf";
import { Buffer } from "buffer";

const ResourceCategoriesPage = () => {
  const theme = useTheme();

  const categories = [
    {
      ParentRid: "Guidelines and Recommended Practices",
      Path: "/documents/zfrnsw/cfu/resources/Guidelines and Recommended Practices",
    },
    {
      ParentRid: "Info/Training Documents",
      Path: "/documents/zfrnsw/cfu/resources/Info Sheets",
    },
    {
      ParentRid: "Policies & Procedures",
      Path: "/documents/zfrnsw/cfu/resources/Policies and Procedures",
    },
    {
      ParentRid: "Skills Maintenance",
      Path: "/documents/zfrnsw/cfu/resources/Skills Maintenance Package and Supporting Documents",
    },
    {
      ParentRid: "Test your CFU Knowledge",
      Path: "/documents/zfrnsw/cfu/resources/Test Your CFU Knowledge",
    },
    {
      ParentRid: "CFU Engage",
      Path: "/documents/zfrnsw/cfu/resources/CFU Engage",
    },
  ];

  const navigate = (category: { ParentRid: string; Path: string }) => {
    screenFlowModule.onNavigateToScreen("ResourceList", category);
  };

  const Tiles = categories.map((category) => {
    return (
      <TouchableOpacity
        style={{ alignItems: "center", padding: 10 }}
        onPress={() => navigate(category)}
      >
        <LucideIcons.Image style={{ width: "100%" }} size={24} />
        <CustomText
          variant="bodySmall"
          style={{ marginTop: 10, textAlign: "center" }}
        >
          {category.ParentRid}
        </CustomText>
      </TouchableOpacity>
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <View style={{ marginVertical: 40, paddingHorizontal: 20 }}>
          <CustomText
            variant="titleLargeBold"
            style={{ marginVertical: 15, color: theme.colors.primary }}
          >
            Resource Categories
          </CustomText>
          {Grid(Tiles, 2, undefined, "#fff", true)}
        </View>
      </ScrollView>
    </View>
  );
};

const loadResourceList = async (Path: string) => {
  const pathURI = encodeURIComponent(Path);

  const odataServiceUrl =
    "https://portal.uat.rfs.nsw.gov.au/sap/opu/odata/sap/Z_CFU_DOCUMENTS_SRV/";
  const batchUrl = `${odataServiceUrl}$batch`;

  const batchBoundary = "batch_4ff0-26cd-29e3";

  const batchReq1 = `Content-Type: application/http
Content-Transfer-Encoding: binary

GET Files?$skip=0&$top=100&$filter=ParentRid%20eq%20%27${pathURI}%27%20and%20Desktop%20eq%20false HTTP/1.1
sap-cancel-on-close: true
sap-contextid-accept: header
Accept: application/json
Accept-Language: en-AU
DataServiceVersion: 2.0
MaxDataServiceVersion: 2.0

`;

  const batchBody = `
--${batchBoundary}
${batchReq1}
--${batchBoundary}--`;

  const username = process.env.BASIC_USERNAME;
  const password = process.env.BASIC_PASSWORD;
  const credentials = btoa(`${username}:${password}`);

  const resources = await axios
    .post(batchUrl, batchBody, {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": `multipart/mixed;boundary=${batchBoundary}`,
        Accept: "multipart/mixed",
        "Accept-Encoding": "gzip, deflate, br, zstd",
      },
    })
    .then((response) => {
      const responseText = response.data;
      const boundary = responseText.match(/^--[A-Za-z0-9]+/)[0];
      const parts = responseText.split(boundary);
      const jsonPart = parts.find((p: string | string[]) =>
        p.includes("application/json")
      );
      const jsonBody = jsonPart.split("\r\n\r\n").pop();
      const data = JSON.parse(jsonBody);

      return data.d.results;
    })
    .catch((error) => {
      console.error("Batch request failed:", error);
    });

  return resources;
};

type resourceListProps = StackScreenProps<
  ResourceStackParamList,
  "ResourceList"
>;

const ResourceListPage = ({ route, navigation }: resourceListProps) => {
  const [resourceList, setResourceList] = useState([]);

  const theme = useTheme();
  const params = route.params ?? {};

  useEffect(() => {
    loadResourceList(params.Path).then((res) => setResourceList(res));
  }, []);

  const navigate = (resource: any) => {
    screenFlowModule.onNavigateToScreen("Resource", resource);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ paddingBottom: 40, backgroundColor: theme.colors.background }}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <CustomText
            variant="titleLargeBold"
            style={{ marginVertical: 15, color: theme.colors.primary }}
          >
            {params.ParentRid}
          </CustomText>
        </View>
        {resourceList && (
          <List.Section>
            {resourceList.map((resource: any, i) => {
              return (
                <React.Fragment key={`resource_${i}`}>
                  <Divider />
                  <List.Item
                    onPress={() => navigate(resource)}
                    right={() => (
                      <LucideIcons.ChevronRight color={theme.colors.outline} />
                    )}
                    left={() => (
                      <View
                        style={{
                          backgroundColor: theme.colors.surfaceDisabled,
                          padding: 5,
                          borderRadius: 50,
                        }}
                      >
                        {resource.FileType.includes("pdf") ? (
                          <LucideIcons.File color={theme.colors.outline} />
                        ) : (
                          <LucideIcons.CodeXml color={theme.colors.outline} />
                        )}
                      </View>
                    )}
                    style={{ marginLeft: 20 }}
                    key={"item_" + i}
                    title={resource.DisplayName}
                  />
                  <Divider />
                </React.Fragment>
              );
            })}
          </List.Section>
        )}
        {resourceList && resourceList.length < 1 && (
          <View style={{ paddingHorizontal: 20 }}>
            <CustomText variant="bodyMedium" style={{ marginVertical: 15 }}>
              No Resources found.
            </CustomText>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const loadResource = async (Path: string, FileType: string) => {
  const pathURI = encodeURIComponent(Path);
  const fileType = encodeURIComponent(FileType);

  const filters = `Url='${pathURI}',FileType='${fileType}'`;
  const odataServiceUrl = `https://portal.uat.rfs.nsw.gov.au/sap/opu/odata/sap/Z_CFU_DOCUMENTS_SRV/FileExports(${filters})/`;
  const valueUrl = `${odataServiceUrl}/$value`;

  const username = process.env.BASIC_USERNAME;
  const password = process.env.BASIC_PASSWORD;
  const credentials = btoa(`${username}:${password}`);

  const resource = await axios
    .get(valueUrl, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      responseType: FileType == "application/pdf" ? "arraybuffer" : "json",
    })
    .then((response) => {
 
      return response.data;
    })
    .catch((error) => {
      console.error("Request failed:", error);
    });

  return resource;
};

type resourceProps = StackScreenProps<ResourceStackParamList, "Resource">;

const ResourcePage = ({ route, navigation }: resourceProps) => {
  const [resource, setResource] = useState();
  const [pdfBase64, setPdfBase64] = useState("")
  const [htmlContent, setHtmlContent] = useState<any>()

  const theme = useTheme();
  const params = route.params ?? {};
  const accessRid = params.AccessRid;
  const fileType = params.FileType;

  useEffect(() => {
    loadResource(accessRid, fileType).then((res) => setResource(res));
  }, []);

  useEffect(() => {
    if(resource && fileType == "application/pdf"){
      const base64String = Buffer.from(resource as any, "binary").toString("base64");
      setPdfBase64(base64String)
    }else if(resource && fileType == "text/html"){
      setHtmlContent(resource)
    }
  }, [resource])

  if(fileType == "text/html"){
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {resource && <WebView
            originWhitelist={['*']} // Important for custom HTML to allow all origins
            source={{ html: htmlContent }}
            javaScriptEnabled={true}
            style={{flex: 1,}}
        />}
      </View>
    )
  }else {
    const source = {uri:`data:application/pdf;base64,${pdfBase64}`};
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {pdfBase64 && <Pdf source={source} style={{flex: 1, width: Dimensions.get("window").width, height: Dimensions.get("window").height}} trustAllCerts={false} />}
      </View>
    );
  }
};

const Resources = () => {
  const Stack = createStackNavigator<ResourceStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName="ResourceCategories"
      screenOptions={{
        headerShown: false,
        cardStyle: GlobalStyles.AppBackground,
        gestureEnabled: true,
        transitionSpec: {
          open: {
            animation: "timing",
            config: {
              duration: 450,
              easing: Easing.inOut(Easing.quad),
            },
          },
          close: {
            animation: "timing",
            config: {
              duration: 450,
              easing: Easing.inOut(Easing.quad),
            },
          },
        },
      }}
    >
      <Stack.Screen
        name="ResourceCategories"
        component={ResourceCategoriesPage}
      />
      <Stack.Screen name="ResourceList" component={ResourceListPage} />
      <Stack.Screen name="Resource" component={ResourcePage} />
    </Stack.Navigator>
  );
};

export default Resources;
