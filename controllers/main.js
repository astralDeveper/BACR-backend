const { Router } = require("express");
const { ErrorHandler, ResHandler } = require("../utliz/ResponseHandlers");
const {
  cloudinary,
  employeImageUploader,
  docsUploader,
  CardImageUploader,
  CvUploader,
} = require("../utliz/FileUploader");
const Employees = require("../models/Employe");
const Certificates = require("../models/Certificates");
const Cards = require("../models/Cards");
const { verifyToken } = require("../utliz/auth");
// const { transporter } = require("../utliz/EmailSender.js");
const nodemailer = require("nodemailer");
require("dotenv").config();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.ETHEREAL_EMAIL,
    pass: process.env.ETHEREAL_PASSWORD,
  },
});

const route = Router();

// routes for employees
route.get("/employees", async (req, res) => {
  try {
    let employees = await Employees.find({}).select(["-_v", "-updatedAt"]);
    let payload = {
      employees,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post(
  "/employe/create",
  verifyToken,
  employeImageUploader,
  async (req, res) => {
    try {
      let employeeData = req.body;
      let file = req?.file;

      let employe = await Employees.create({
        ...employeeData,
        image: file,
      });

      let payload = {
        employe,
      };

      return ResHandler(payload, req, res);
    } catch (error) {
      return ErrorHandler(error, req, res);
    }
  }
);

route.put(
  "/employe/update/:id",
  verifyToken,
  employeImageUploader,
  async (req, res) => {
    try {
      let { id } = req.params;
      let data = req.body;
      let file = req.file;

      if (!id) {
        throw new Error("Bad Request");
      }

      if (file) {
        let employe = await Employees.findById(id);
        if (employe.image) {
          let fileidPath = employe.image.filename;
          await cloudinary.api.delete_resources([fileidPath], {
            resource_type: employe?.image?.mimetype?.split("/")[0] ?? "image",
            type: "upload",
          });
        }

        employe.image = file;
        await employe.save();
      }

      let employe = await Employees.findByIdAndUpdate(id, data, { new: true });

      let payload = {
        employe,
      };

      return ResHandler(payload, req, res);
    } catch (error) {
      console.log(error.message);
      return ErrorHandler(error, req, res);
    }
  }
);

route.delete("/employe/delete/:id", verifyToken, async (req, res) => {
  try {
    let { id } = req.params;

    if (!id) {
      throw new Error("Bad request");
    }

    let employe = await Employees.findById(id);

    if (!employe) {
      throw new Error("Bad request");
    }

    let fileidPath = employe.image.filename;

    await cloudinary.api.delete_resources([fileidPath], {
      resource_type: employe?.image?.mimetype?.split("/")[0] ?? "image",
      type: "upload",
    });

    await Employees.findByIdAndDelete(id);

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post(
  "/employe/image/:id",
  verifyToken,
  employeImageUploader,
  async (req, res) => {
    try {
      let { id } = req.params;

      let employe = await Employees.findById(id);

      let file = req?.file;

      if (!employe) {
        throw new Error("bad request");
      }

      if (employe.image) {
        await cloudinary.api.delete_resources([employe.image.filename], {
          resource_type: employe?.image?.mimetype?.split("/")[0] ?? "image",
          type: "upload",
        });
      }

      employe.image = file;
      await employe.save();

      let payload = { employe };

      return ResHandler(payload, req, res);
    } catch (error) {
      return ErrorHandler(error, req, res);
    }
  }
);

// routes for certificates
route.get("/docs", async (req, res) => {
  try {
    let certificates = await Certificates.find({}).select([
      "-__v",
      "-updatedAt",
    ]);
    let payload = {
      docs: certificates,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post("/docs/upload", verifyToken, docsUploader, async (req, res) => {
  try {
    let file = req?.file;
    let body = req.body;

    let doc = await Certificates.create({ ...file, ...body });

    let payload = {
      doc,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    console.log(error);
    return ErrorHandler(error, req, res);
  }
});

route.put("/docs/update/:id", verifyToken, docsUploader, async (req, res) => {
  try {
    let { id } = req.params;
    let file = req?.file;
    let body = req.body;

    let doc = await Certificates.findOne({ _id: id });
    if (file) {
      if (doc.filename) {
        await cloudinary.api.delete_resources([doc.filename], {
          resource_type: doc?.mimetype?.split("/")[0] ?? "image",
          type: "upload",
        });

        await Certificates.findOneAndUpdate({ _id: id }, file);
      }
    }

    let updatedDoc = await Certificates.findOneAndUpdate(
      { _id: id },
      { name: body.name },
      { new: true }
    );

    let payload = {
      doc: updatedDoc,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    console.log(error);
    return ErrorHandler(error, req, res);
  }
});

route.delete("/docs/delete/:id", verifyToken, async (req, res) => {
  try {
    let { id } = req.params;

    if (!id) {
      throw new Error("Bad request");
    }

    let doc = await Certificates.findById(id);

    if (!doc) {
      throw new Error("Certificate not found.");
    }

    await cloudinary.api.delete_resources([doc.filename], {
      resource_type: doc?.mimetype?.split("/")[0] ?? "image",
      type: "upload",
    });

    await Certificates.findByIdAndDelete(id);

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post(
  "/cards/create",
  verifyToken,
  CardImageUploader,
  async (req, res) => {
    try {
      let body = req.body;

      let logo = req.files["logo"][0];
      let bgImg = req.files["bg_img"][0];

      if (!logo || !bgImg) {
        throw new Error("All fields are required.");
      }

      let card = await Cards.create({
        ...body,
        image: logo,
        bg_img: bgImg,
        is_parent: true,
      });
      let payload = {
        card,
      };
      return ResHandler(payload, req, res);
    } catch (error) {
      console.log(error.message);
      return ErrorHandler(error, req, res);
    }
  }
);

route.post(
  "/cards/create/child/:id",
  verifyToken,
  CardImageUploader,
  async (req, res) => {
    try {
      let { id } = req.params;
      let body = req.body;
      let file = req.files["logo"][0];
      let card = await Cards.create({ ...body, image: file });

      await Cards.findOneAndUpdate({ _id: id }, { $push: { items: card._id } });

      let payload = {
        card,
      };
      return ResHandler(payload, req, res);
    } catch (error) {
      console.log(error.message);
      return ErrorHandler(error, req, res);
    }
  }
);

route.get("/cards", async (req, res) => {
  try {
    let cards = await Cards.find({ is_parent: true }).populate({
      path: "items",
    });
    let payload = {
      cards,
    };
    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.delete("/card/delete/parent/:id", verifyToken, async (req, res) => {
  try {
    let { id } = req.params;
    let Card = await Cards.findById(id);

    if (Card.items.length) {
      Card.items.forEach(async (item) => {
        let cardItem = await Cards.findById(item._id);

        if (cardItem.image) {
          await cloudinary.api.delete_resources([cardItem.image.filename], {
            resource_type: cardItem?.image?.mimetype?.split("/")[0] ?? "image",
            type: "upload",
          });
        }

        await Cards.findByIdAndDelete(item._id);
      });
    }

    if (Card.image) {
      await cloudinary.api.delete_resources([Card.image.filename], {
        resource_type: Card?.image?.mimetype?.split("/")[0] ?? "image",
        type: "upload",
      });
    }

    if (Card.bg_img) {
      await cloudinary.api.delete_resources([Card.bg_img.filename], {
        resource_type: Card?.bg_img?.mimetype?.split("/")[0] ?? "image",
        type: "upload",
      });
    }

    await Cards.findByIdAndDelete(id);

    return res.status(200).json({ msg: "Card Deleted successfully" });
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.delete(
  "/card/delete/:parentID/:childID",
  verifyToken,
  async (req, res) => {
    try {
      let { parentID, childID } = req.params;
      let Card = await Cards.findById(childID);

      if (Card.image) {
        await cloudinary.api.delete_resources([Card.image.filename], {
          resource_type: Card?.image?.mimetype?.split("/")[0] ?? "image",
          type: "upload",
        });
      }

      await Cards.findByIdAndDelete(childID);
      await Cards.findOneAndUpdate(
        { _id: parentID },
        { $pull: { items: childID } }
      );
      return res.status(200).json({ msg: "Card Deleted successfully" });
    } catch (error) {
      console.log(error.message);
      return ErrorHandler(error, req, res);
    }
  }
);

route.put("/card/update/parent/:id", CardImageUploader, async (req, res) => {
  try {
    let { id } = req.params;
    let card = await Cards.findById(id);
    let data = req.body;
    let files = Object.keys(req?.files);

    if (files?.length) {
      let logo = req?.files?.logo;
      let bgImg = req?.files?.bg_img;

      if (logo?.length) {
        await cloudinary.api.delete_resources([card.image.filename], {
          resource_type: card?.image?.mimetype?.split("/")[0] ?? "image",
          type: "upload",
        });

        card.image = logo[0];
        await card.save();
      }

      if (bgImg?.length) {
        await cloudinary.api.delete_resources([card.bg_img.filename], {
          resource_type: card?.bg_img?.mimetype?.split("/")[0] ?? "image",
          type: "upload",
        });

        card.bg_img = bgImg[0];
        await card.save();
      }
    }

    let updatedCard = await Cards.findByIdAndUpdate(id, data, {
      new: true,
    }).populate({
      path: "items",
    });

    let payload = {
      card: updatedCard,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/card/update/child/:id", CardImageUploader, async (req, res) => {
  try {
    let { id } = req.params;
    let card = await Cards.findById(id);
    let data = req.body;
    let files = Object.keys(req.files);

    if (!files.length && !data) {
      throw new Error("Unable to update card with empty fields.");
    }

    if (files.length) {
      await cloudinary.api.delete_resources([card.image.filename], {
        resource_type: card?.image?.mimetype?.split("/")[0] ?? "image",
        type: "upload",
      });

      card.image = req.files["logo"][0];
      await card.save();
    }

    let updatedCard = await Cards.findByIdAndUpdate(id, data, {
      new: true,
    });

    let payload = {
      card: updatedCard,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.get("/card/:id", async (req, res) => {
  try {
    let { id } = req.params;

    let card = await Cards.findOne({ name: id }).populate({
      path: "items",
    });

    let payload = {
      card,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post("/send-email", CvUploader, async (req, res) => {
  try {
    let file = req.file;
    let data = req.body;

    if (!file || !data?.fullname?.length || !data.applyingFor?.length) {
      return res
        .status(400)
        .json({ msg: "Bad Request, all fields are required." });
    }

    const mailOptions = {
      from: "bacr@gmail.com",
      to: "assunta.hand38@ethereal.email",
      subject: "New Job Application",
      html: `<p>Name: ${data?.fullname}</p><p>Applying For: ${data.applyingFor}</p>`,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({msg:"Email send successfully."})

  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

module.exports = route;
